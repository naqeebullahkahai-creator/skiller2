import { useState, useRef, useEffect, memo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: string;
  aspectRatio?: "square" | "video" | "auto";
}

// Shared Intersection Observer for all images
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, () => void>();

const getSharedObserver = () => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = observerCallbacks.get(entry.target);
            if (callback) {
              callback();
              observerCallbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: "300px", // Start loading 300px before viewport
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
};

const LazyImage = memo(({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  priority = false,
  fallback = "/placeholder.svg",
  aspectRatio = "auto",
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use shared observer for better performance
  useEffect(() => {
    if (priority || isInView) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = getSharedObserver();
    observerCallbacks.set(element, () => setIsInView(true));
    observer.observe(element);

    return () => {
      observerCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, [priority, isInView]);

  // Optimized image URL generation with WebP and quality compression
  const getOptimizedSrc = useCallback((originalSrc: string): string => {
    if (!originalSrc) return fallback;
    
    // For Unsplash images - aggressive optimization
    if (originalSrc.includes("unsplash.com")) {
      const url = new URL(originalSrc);
      url.searchParams.set("fm", "webp");
      url.searchParams.set("q", "75");
      // Calculate optimal size based on display size
      const displayWidth = width ? Math.min(width * 2, 800) : 400;
      const displayHeight = height ? Math.min(height * 2, 800) : 400;
      url.searchParams.set("w", String(displayWidth));
      url.searchParams.set("h", String(displayHeight));
      url.searchParams.set("fit", "crop");
      url.searchParams.set("auto", "format,compress");
      return url.toString();
    }

    // For Supabase storage - add transformation params if supported
    if (originalSrc.includes("supabase.co/storage")) {
      // Supabase storage URLs can be optimized via query params
      const separator = originalSrc.includes("?") ? "&" : "?";
      return `${originalSrc}${separator}width=${width || 400}&quality=75`;
    }

    return originalSrc;
  }, [fallback, width, height]);

  const optimizedSrc = getOptimizedSrc(src);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatioClass,
        containerClassName
      )}
    >
      {/* Optimized shimmer skeleton */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/5 to-muted animate-shimmer bg-[length:200%_100%]" 
          aria-hidden="true"
        />
      )}

      {/* Actual image - only render when in view */}
      {isInView && (
        <img
          src={hasError ? fallback : optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            "transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0",
            "object-cover", // Ensure all images use object-cover
            className
          )}
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;

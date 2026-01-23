import { useState, useRef, useEffect, memo } from "react";
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

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Convert to WebP if supported and using Unsplash or external images
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return fallback;
    
    // For Unsplash images, add quality and format params
    if (originalSrc.includes("unsplash.com")) {
      const url = new URL(originalSrc);
      url.searchParams.set("fm", "webp");
      url.searchParams.set("q", "75");
      if (width) url.searchParams.set("w", String(Math.min(width * 2, 1200))); // 2x for retina, max 1200
      if (height) url.searchParams.set("h", String(Math.min(height * 2, 1200)));
      url.searchParams.set("fit", "crop");
      url.searchParams.set("auto", "format,compress");
      return url.toString();
    }

    return originalSrc;
  };

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
      {/* Shimmer skeleton placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Actual image */}
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
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export default LazyImage;

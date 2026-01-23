import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallback?: string;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  priority = false,
  fallback = "/placeholder.svg",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Convert to WebP if supported and using Unsplash
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!originalSrc) return fallback;
    
    // For Unsplash images, add quality and format params
    if (originalSrc.includes("unsplash.com")) {
      const url = new URL(originalSrc);
      url.searchParams.set("fm", "webp");
      url.searchParams.set("q", "80");
      if (width) url.searchParams.set("w", String(width));
      if (height) url.searchParams.set("h", String(height));
      url.searchParams.set("fit", "crop");
      return url.toString();
    }

    // For Supabase storage, return as is (can be optimized server-side)
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        containerClassName
      )}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError ? fallback : optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            "transition-opacity duration-300 object-cover",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

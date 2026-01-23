import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductVariant } from "@/hooks/useProductVariants";

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string | null;
  productTitle: string;
  discount?: number;
  selectedVariant?: ProductVariant | null;
  variants?: ProductVariant[];
}

interface MediaItem {
  type: "image" | "video";
  url: string;
  variantValue?: string;
  thumbnail?: string;
}

// Extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Extract TikTok video ID
const getTikTokId = (url: string): string | null => {
  const regExp = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const ProductGallery = ({
  images,
  videoUrl,
  productTitle,
  discount,
  selectedVariant,
  variants = [],
}: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchStartDistance = useRef<number | null>(null);

  // Build media items array with video first if present
  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = [];

    // Add video as first item if present
    if (videoUrl) {
      const youtubeId = getYouTubeId(videoUrl);
      const tiktokId = getTikTokId(videoUrl);
      items.push({
        type: "video",
        url: videoUrl,
        thumbnail: youtubeId
          ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
          : "/placeholder.svg",
      });
    }

    // Filter images based on selected variant
    if (selectedVariant?.image_urls && selectedVariant.image_urls.length > 0) {
      // Show variant-specific images
      selectedVariant.image_urls.forEach((url) => {
        items.push({
          type: "image",
          url,
          variantValue: selectedVariant.variant_value,
        });
      });
    } else {
      // Show all product images
      images.forEach((url) => {
        items.push({ type: "image", url });
      });
    }

    return items;
  }, [images, videoUrl, selectedVariant]);

  // Reset to first image when variant changes
  useEffect(() => {
    if (selectedVariant) {
      setSelectedIndex(videoUrl ? 1 : 0); // Skip video thumbnail
    }
  }, [selectedVariant, videoUrl]);

  const currentItem = mediaItems[selectedIndex] || mediaItems[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || currentItem?.type !== "image") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistance.current = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(3, Math.max(1, (distance / pinchStartDistance.current) * scale));
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      if (touchStart && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStart.x;
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            navigateMedia(-1);
          } else {
            navigateMedia(1);
          }
        }
      }
      setTouchStart(null);
      pinchStartDistance.current = null;
      // Reset scale after a short delay
      setTimeout(() => setScale(1), 300);
    }
  };

  const navigateMedia = (direction: number) => {
    setSelectedIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return mediaItems.length - 1;
      if (newIndex >= mediaItems.length) return 0;
      return newIndex;
    });
    setIsVideoPlaying(false);
  };

  const handleVideoClick = () => {
    if (currentItem?.type === "video") {
      setIsVideoPlaying(true);
    }
  };

  const renderVideoEmbed = (url: string, autoplay = false) => {
    const youtubeId = getYouTubeId(url);
    const tiktokId = getTikTokId(url);

    if (youtubeId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&controls=1&modestbranding=1`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (tiktokId) {
      return (
        <iframe
          src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Direct video URL
    return (
      <video
        src={url}
        className="w-full h-full object-cover"
        controls
        autoPlay={autoplay}
        muted={autoplay}
      />
    );
  };

  return (
    <>
      <div className="sticky top-24" ref={containerRef}>
        {/* Main Display */}
        <div
          className={cn(
            "relative aspect-square bg-muted rounded-lg overflow-hidden mb-4",
            currentItem?.type === "image" && "cursor-zoom-in"
          )}
          onMouseEnter={() => currentItem?.type === "image" && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (currentItem?.type === "video" && !isVideoPlaying) {
              handleVideoClick();
            } else if (currentItem?.type === "image") {
              setShowLightbox(true);
            }
          }}
        >
          {currentItem?.type === "video" ? (
            isVideoPlaying ? (
              renderVideoEmbed(currentItem.url, true)
            ) : (
              <div className="relative w-full h-full group">
                <img
                  src={currentItem.thumbnail || "/placeholder.svg"}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                  VIDEO
                </div>
              </div>
            )
          ) : (
            <img
              src={currentItem?.url || "/placeholder.svg"}
              alt={productTitle}
              className={cn(
                "w-full h-full object-contain transition-transform duration-200",
                isZoomed && "scale-150 md:scale-150",
                scale > 1 && "md:scale-100"
              )}
              style={{
                transformOrigin: isZoomed
                  ? `${zoomPosition.x}% ${zoomPosition.y}%`
                  : "center",
                transform: scale > 1 ? `scale(${scale})` : undefined,
              }}
            />
          )}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia(-1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md z-10"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Discount Badge */}
          {discount && discount > 0 && currentItem?.type !== "video" && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded z-10">
              -{discount}%
            </div>
          )}

          {/* Zoom Indicator (Desktop) */}
          {currentItem?.type === "image" && (
            <div className="hidden md:flex absolute bottom-3 right-3 bg-card/80 p-2 rounded-lg items-center gap-1 text-xs text-muted-foreground">
              <ZoomIn size={14} />
              Hover to zoom
            </div>
          )}

          {/* Pinch Indicator (Mobile) */}
          {currentItem?.type === "image" && (
            <div className="md:hidden absolute bottom-3 right-3 bg-card/80 p-2 rounded-lg text-xs text-muted-foreground">
              Tap for fullscreen
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {mediaItems.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {mediaItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  setIsVideoPlaying(false);
                }}
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                  selectedIndex === index
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground"
                )}
              >
                <img
                  src={item.type === "video" ? item.thumbnail || "/placeholder.svg" : item.url}
                  alt={`${productTitle} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={16} className="text-white" fill="currentColor" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Variant Image Indicator */}
        {selectedVariant?.image_urls && selectedVariant.image_urls.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Showing images for: <span className="font-medium text-foreground">{selectedVariant.variant_value}</span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && currentItem?.type === "image" && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} className="text-white" />
          </button>

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia(-1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={28} className="text-white" />
              </button>
            </>
          )}

          <img
            src={currentItem.url}
            alt={productTitle}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Thumbnail Navigation in Lightbox */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
            {mediaItems
              .filter((item) => item.type === "image")
              .map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    const actualIndex = mediaItems.findIndex((m) => m.url === item.url);
                    setSelectedIndex(actualIndex);
                  }}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors",
                    currentItem.url === item.url
                      ? "border-primary"
                      : "border-transparent hover:border-white/50"
                  )}
                >
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;

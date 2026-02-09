import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import { useActiveBanners } from "@/hooks/useMarketing";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  SIZE_MAP, getGradientCSS, getAnimationClass,
  getAlignmentClass, getTitleStyle, getSubtitleStyle,
} from "@/utils/bannerStyles";

const MobileHeroBanner = () => {
  const { banners, isLoading } = useActiveBanners();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, align: "start", skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || banners.length <= 1) return;
    const timer = setInterval(() => { emblaApi.scrollNext(); }, 4000);
    return () => clearInterval(timer);
  }, [emblaApi, banners.length]);

  if (isLoading) return <Skeleton className="w-full aspect-[16/9]" />;

  if (banners.length === 0) {
    return (
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 text-center">
        <h1 className="text-xl font-bold mb-1">Welcome to FANZON</h1>
        <p className="text-sm text-primary-foreground/80">Pakistan's Best Marketplace</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner, index) => {
            const isActive = index === selectedIndex;
            // Use smaller sizes on mobile
            const mobileTitleSize = ["5xl", "6xl", "4xl"].includes(banner.title_size || "2xl")
              ? "xl" : (banner.title_size || "base");
            const mobileSubSize = ["3xl", "4xl", "5xl", "6xl"].includes(banner.subtitle_size || "base")
              ? "sm" : (banner.subtitle_size || "sm");

            return (
              <Link
                key={banner.id}
                to={banner.link_type === "category" ? `/category/${banner.link_value}` : banner.link_value || "/"}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="relative aspect-[16/9]">
                  <img src={banner.image_url} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: getGradientCSS(banner) }} />
                  <div className={cn(
                    "absolute inset-0 flex flex-col justify-end p-3",
                    getAlignmentClass(banner.text_alignment),
                  )}>
                    <div className={cn(isActive ? getAnimationClass(banner.animation_type, true) : "")}>
                      {banner.title && (
                        <h2
                          style={getTitleStyle(banner)}
                          className={cn(SIZE_MAP[mobileTitleSize], "drop-shadow-lg line-clamp-1")}
                        >
                          {banner.title}
                        </h2>
                      )}
                      {banner.subtitle && (
                        <p
                          style={getSubtitleStyle(banner)}
                          className={cn(SIZE_MAP[mobileSubSize], "drop-shadow-md mt-0.5 line-clamp-1")}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.button_text && (
                        <span
                          className="inline-block mt-2 px-3 py-1.5 rounded text-xs font-semibold shadow-md"
                          style={{ backgroundColor: banner.button_color || "#F85606", color: banner.button_text_color || "#FFFFFF" }}
                        >
                          {banner.button_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === selectedIndex ? "w-5 bg-primary" : "w-1.5 bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileHeroBanner;

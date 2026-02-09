import { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight, Zap, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveBanners } from "@/hooks/useMarketing";
import { useAdminBanners } from "@/hooks/useMarketing";
import { useVisualEdit } from "@/contexts/VisualEditContext";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/ui/lazy-image";
import InlineEditableText from "@/components/admin/InlineEditableText";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SIZE_MAP, getGradientCSS, getAnimationClass,
  getAlignmentClass, getTitleStyle, getSubtitleStyle,
} from "@/utils/bannerStyles";

const HeroCarousel = memo(() => {
  const { banners, isLoading } = useActiveBanners();
  const { updateBanner } = useAdminBanners();
  const { isEditMode } = useVisualEdit();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrev = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % banners.length);

  const handleTitleUpdate = async (bannerId: string, newTitle: string) => {
    try {
      await updateBanner(bannerId, { title: newTitle });
      toast({ title: "Banner updated" });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <section className="bg-secondary py-2">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
            <Skeleton className="lg:col-span-3 h-[200px] md:h-[300px] rounded" />
            <div className="hidden lg:flex flex-col gap-2">
              <Skeleton className="h-[146px] rounded" />
              <Skeleton className="h-[146px] rounded" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="bg-secondary py-2">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded text-primary-foreground p-8 md:p-12 text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome to FANZON</h1>
            <p className="text-primary-foreground/90 mb-6">Pakistan's Best Online Marketplace</p>
            <Button asChild className="bg-white text-primary hover:bg-white/90 font-semibold">
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary py-2">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Main Carousel */}
          <div className="lg:col-span-3 relative rounded overflow-hidden bg-card">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner, index) => {
                const isActive = index === currentSlide;
                return (
                  <Link
                    key={banner.id}
                    to={banner.link_type === "category" ? `/category/${banner.link_value}` : banner.link_value || "/"}
                    className="relative w-full flex-shrink-0 block"
                  >
                    <div className="relative aspect-[21/9] md:aspect-[3/1]">
                      <LazyImage
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        className="w-full h-full object-cover"
                      />
                      {/* Dynamic Gradient Overlay */}
                      <div className="absolute inset-0" style={{ background: getGradientCSS(banner) }} />
                      
                      {/* Banner Content with animations */}
                      <div className={cn(
                        "absolute inset-0 flex flex-col justify-end p-4",
                        getAlignmentClass(banner.text_alignment),
                      )}>
                        <div className={cn(isActive ? getAnimationClass(banner.animation_type, true) : "")}>
                          {isEditMode ? (
                            <InlineEditableText
                              value={banner.title || ""}
                              onSave={(newTitle) => handleTitleUpdate(banner.id, newTitle)}
                              className={cn(SIZE_MAP[banner.title_size || "2xl"], "drop-shadow-lg")}
                            />
                          ) : (
                            banner.title && (
                              <h2
                                style={getTitleStyle(banner)}
                                className={cn(SIZE_MAP[banner.title_size || "2xl"], "drop-shadow-lg")}
                              >
                                {banner.title}
                              </h2>
                            )
                          )}
                          {banner.subtitle && (
                            <p
                              style={getSubtitleStyle(banner)}
                              className={cn(SIZE_MAP[banner.subtitle_size || "base"], "drop-shadow-md mt-1")}
                            >
                              {banner.subtitle}
                            </p>
                          )}
                          {banner.button_text && (
                            <span
                              className="inline-block mt-3 px-5 py-2 rounded-md font-semibold text-sm shadow-lg"
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

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button onClick={goToPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all">
                  <ChevronLeft size={20} className="text-foreground" />
                </button>
                <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all">
                  <ChevronRight size={20} className="text-foreground" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlide ? "bg-primary w-6" : "bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side Cards */}
          <div className="hidden lg:flex flex-col gap-2">
            <Link to="/flash-sale" className="relative rounded overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-white p-4 h-[146px] hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2"><Zap size={40} className="text-white/20" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-yellow-300" /><span className="text-sm font-semibold">Flash Sale</span></div>
                <p className="text-xl font-bold">Up to 70% OFF</p>
                <p className="text-xs text-white/80 mt-1">Limited Time Only</p>
              </div>
            </Link>
            <Link to="/vouchers" className="relative rounded overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 h-[146px] hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2"><Tag size={40} className="text-white/20" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><Tag size={18} className="text-yellow-300" /><span className="text-sm font-semibold">Collect Vouchers</span></div>
                <p className="text-xl font-bold">Extra Savings</p>
                <p className="text-xs text-white/80 mt-1">Free Shipping & More</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroCarousel.displayName = "HeroCarousel";
export default HeroCarousel;

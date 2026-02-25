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
      <section className="py-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <Skeleton className="lg:col-span-3 h-[200px] md:h-[320px] rounded-2xl" />
            <div className="hidden lg:flex flex-col gap-3">
              <Skeleton className="h-[155px] rounded-2xl" />
              <Skeleton className="h-[155px] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="py-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl text-primary-foreground p-10 md:p-16 text-center shadow-elevated">
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Welcome to FANZOON</h1>
            <p className="text-primary-foreground/85 text-lg mb-8 max-w-md mx-auto">Pakistan's Best Online Marketplace</p>
            <Button asChild className="bg-card text-primary hover:bg-card/90 font-bold px-8 py-3 rounded-xl shadow-lg">
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main Carousel */}
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-card shadow-card">
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
                      <div className="absolute inset-0" style={{ background: getGradientCSS(banner) }} />
                      
                      <div className={cn(
                        "absolute inset-0 flex flex-col justify-end p-6",
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
                                className={cn(SIZE_MAP[banner.title_size || "2xl"], "drop-shadow-lg font-display")}
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
                              className="inline-block mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg"
                              style={{ backgroundColor: banner.button_color || "hsl(252, 60%, 52%)", color: banner.button_text_color || "#FFFFFF" }}
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
                <button onClick={goToPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card rounded-xl p-2 shadow-md transition-all">
                  <ChevronLeft size={20} className="text-foreground" />
                </button>
                <button onClick={goToNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card rounded-xl p-2 shadow-md transition-all">
                  <ChevronRight size={20} className="text-foreground" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        index === currentSlide ? "bg-primary w-7" : "bg-card/60 hover:bg-card w-2"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side Cards */}
          <div className="hidden lg:flex flex-col gap-3">
            <Link to="/flash-sale" className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5 h-[155px] hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-3 right-3"><Zap size={40} className="text-primary-foreground/15" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-fanzon-star" /><span className="text-sm font-semibold">Flash Sale</span></div>
                <p className="text-xl font-display font-bold">Up to 70% OFF</p>
                <p className="text-xs text-primary-foreground/70 mt-1">Limited Time Only</p>
              </div>
            </Link>
            <Link to="/vouchers" className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-fanzon-emerald to-fanzon-success text-primary-foreground p-5 h-[155px] hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-3 right-3"><Tag size={40} className="text-primary-foreground/15" /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><Tag size={18} className="text-fanzon-star" /><span className="text-sm font-semibold">Collect Vouchers</span></div>
                <p className="text-xl font-display font-bold">Extra Savings</p>
                <p className="text-xs text-primary-foreground/70 mt-1">Free Shipping & More</p>
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

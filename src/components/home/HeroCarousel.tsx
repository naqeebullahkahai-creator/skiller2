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
            <Skeleton className="lg:col-span-3 h-[200px] md:h-[380px] rounded-2xl" />
            <div className="hidden lg:flex flex-col gap-3">
              <Skeleton className="h-[184px] rounded-2xl" />
              <Skeleton className="h-[184px] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const SideCards = () => (
    <div className="hidden lg:flex flex-col gap-3">
      <Link to="/flash-sale" className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85 text-primary-foreground p-6 flex-1 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-x-4 -translate-y-4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <Zap size={16} className="text-accent" />
            </div>
            <span className="text-sm font-semibold">Flash Sale</span>
          </div>
          <p className="text-xl font-display font-bold tracking-tight">Up to 70% OFF</p>
          <p className="text-xs text-primary-foreground/50 mt-1">Limited Time Only →</p>
        </div>
      </Link>
      <Link to="/vouchers" className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground p-6 flex-1 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full translate-x-4 translate-y-4" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Tag size={16} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Vouchers</span>
          </div>
          <p className="text-xl font-display font-bold tracking-tight">Extra Savings</p>
          <p className="text-xs text-primary-foreground/50 mt-1">Free Shipping & More →</p>
        </div>
      </Link>
    </div>
  );

  if (banners.length === 0) {
    return (
      <section className="py-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-3 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl text-primary-foreground p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
              <div className="relative z-10">
                <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 tracking-tight">Welcome to FANZOON</h1>
                <p className="text-primary-foreground/75 text-lg mb-8 max-w-md mx-auto">Pakistan's Best Online Marketplace</p>
                <Button asChild className="bg-card text-primary hover:bg-card/90 font-bold px-8 py-3 rounded-xl shadow-lg">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
            <SideCards />
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
          <div className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-card" style={{ boxShadow: 'var(--shadow-3)' }}>
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
                        "absolute inset-0 flex flex-col justify-end p-6 md:p-10",
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
                                className={cn(SIZE_MAP[banner.title_size || "2xl"], "drop-shadow-lg font-display tracking-tight")}
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
                              className="inline-block mt-4 px-7 py-3 rounded-xl font-semibold text-sm shadow-lg"
                              style={{ backgroundColor: banner.button_color || "hsl(173, 78%, 26%)", color: banner.button_text_color || "#FFFFFF" }}
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

            {/* Navigation */}
            {banners.length > 1 && (
              <>
                <button onClick={goToPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card rounded-xl p-2.5 shadow-md transition-all hover:scale-105">
                  <ChevronLeft size={20} className="text-foreground" />
                </button>
                <button onClick={goToNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card rounded-xl p-2.5 shadow-md transition-all hover:scale-105">
                  <ChevronRight size={20} className="text-foreground" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-foreground/20 backdrop-blur-sm rounded-full px-2 py-1">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentSlide ? "bg-primary-foreground w-6" : "bg-primary-foreground/40 hover:bg-primary-foreground/60 w-1.5"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side Cards */}
          <SideCards />
        </div>
      </div>
    </section>
  );
});

HeroCarousel.displayName = "HeroCarousel";
export default HeroCarousel;

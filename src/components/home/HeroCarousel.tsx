import { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import LazyImage from "@/components/ui/lazy-image";
import InlineEditableText from "@/components/admin/InlineEditableText";
import { useVisualEdit } from "@/contexts/VisualEditContext";
import { useActiveBanners, useAdminBanners } from "@/hooks/useMarketing";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const HeroCarousel = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners, isLoading } = useActiveBanners();
  const { updateBanner } = useAdminBanners();
  const { isEditMode, canEdit } = useVisualEdit();
  const { toast } = useToast();

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const goToPrev = () => banners.length && setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  const goToNext = () => banners.length && setCurrentSlide((prev) => (prev + 1) % banners.length);

  const handleTitleUpdate = async (bannerId: string, newTitle: string) => {
    const success = await updateBanner(bannerId, { title: newTitle });
    if (success) toast({ title: "Updated!", description: "Banner title saved." });
  };

  if (isLoading) {
    return (
      <section className="relative w-full bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl" />
            </div>
            <div className="hidden lg:grid grid-rows-2 gap-4">
              <Skeleton className="w-full rounded-2xl" />
              <Skeleton className="w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative w-full bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">FANZON</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Pakistan's Premium Multi-Vendor Marketplace
            </p>
            <Button size="lg" className="rounded-full px-8">
              Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Carousel */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1] shadow-xl">
            <div 
              className="flex transition-transform duration-700 ease-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {banners.map((banner, index) => (
                <div 
                  key={banner.id} 
                  className={cn(
                    "w-full h-full flex-shrink-0 relative",
                    isEditMode && canEdit && "ring-2 ring-primary ring-dashed"
                  )}
                >
                  <LazyImage
                    src={banner.image_url}
                    alt={banner.title}
                    priority={index === 0}
                    width={1200}
                    height={600}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="p-6 md:p-12 max-w-lg">
                      <span className="inline-block text-primary text-xs md:text-sm font-semibold mb-2 uppercase tracking-wider">
                        Special Offer
                      </span>
                      <h2 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight">
                        <InlineEditableText
                          value={banner.title}
                          onSave={(newTitle) => handleTitleUpdate(banner.id, newTitle)}
                          className="text-white"
                        />
                      </h2>
                      <p className="text-white/80 text-sm md:text-base mb-4 md:mb-6 hidden md:block">
                        Discover amazing deals on premium products
                      </p>
                      <Button 
                        size="lg" 
                        className="rounded-full px-6 md:px-8 shadow-lg hover:shadow-primary/30 transition-all duration-300"
                      >
                        Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <button
              onClick={goToPrev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 p-2 md:p-3 rounded-full transition-all duration-300"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/40 p-2 md:p-3 rounded-full transition-all duration-300"
            >
              <ChevronRight size={20} className="text-white" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    currentSlide === index 
                      ? "bg-primary w-8" 
                      : "bg-white/50 w-2 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Side Cards */}
          <div className="hidden lg:grid grid-rows-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg group cursor-pointer">
              <div className="absolute inset-0 p-6 flex flex-col justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-primary-foreground/70 text-xs uppercase tracking-widest font-medium">Limited Time</span>
                <h3 className="text-primary-foreground font-bold text-2xl mt-2">Flash Sale</h3>
                <p className="text-primary-foreground/90 text-sm mt-2">Up to 70% Off</p>
                <div className="mt-4 flex items-center text-primary-foreground text-sm font-medium group-hover:gap-3 gap-1 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-lg group cursor-pointer">
              <div className="absolute inset-0 p-6 flex flex-col justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white/60 text-xs uppercase tracking-widest font-medium">New Arrivals</span>
                <h3 className="text-white font-bold text-2xl mt-2">Electronics</h3>
                <p className="text-white/80 text-sm mt-2">Shop Latest Tech</p>
                <div className="mt-4 flex items-center text-white text-sm font-medium group-hover:gap-3 gap-1 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroCarousel.displayName = "HeroCarousel";

export default HeroCarousel;

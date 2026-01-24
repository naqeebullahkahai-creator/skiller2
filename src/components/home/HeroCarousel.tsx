import { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleTitleUpdate = async (bannerId: string, newTitle: string) => {
    const success = await updateBanner(bannerId, { title: newTitle });
    if (success) {
      toast({ title: "Updated!", description: "Banner title saved." });
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="container mx-auto py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Skeleton className="w-full aspect-[2.5/1] md:aspect-[3/1] rounded-lg" />
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              <Skeleton className="flex-1 rounded-lg" />
              <Skeleton className="flex-1 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="container mx-auto py-4">
          <div className="aspect-[2.5/1] md:aspect-[3/1] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No banners available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <div className="container mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Carousel */}
          <div className="lg:col-span-3 relative rounded-lg overflow-hidden aspect-[2.5/1] md:aspect-[3/1]">
            <div 
              className="flex transition-transform duration-500 ease-out h-full"
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
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                    <div className="p-6 md:p-10">
                      <h2 className="text-white text-lg md:text-3xl font-bold mb-2">
                        <InlineEditableText
                          value={banner.title}
                          onSave={(newTitle) => handleTitleUpdate(banner.id, newTitle)}
                          className="text-white text-lg md:text-3xl font-bold"
                        />
                      </h2>
                      <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm font-medium transition-colors">
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md transition-colors"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    currentSlide === index ? "bg-primary" : "bg-card/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Side Banners */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="flex-1 relative rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/70">
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                <p className="text-primary-foreground/80 text-xs uppercase tracking-wider">Limited Time</p>
                <h3 className="text-primary-foreground font-bold text-lg mt-1">Flash Sale</h3>
                <p className="text-primary-foreground/90 text-sm mt-2">Up to 70% Off</p>
              </div>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-600">
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                <p className="text-white/80 text-xs uppercase tracking-wider">New Arrivals</p>
                <h3 className="text-white font-bold text-lg mt-1">Electronics</h3>
                <p className="text-white/90 text-sm mt-2">Shop Latest Tech</p>
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

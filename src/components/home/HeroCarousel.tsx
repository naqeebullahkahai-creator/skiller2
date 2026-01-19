import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { banners } from "@/data/mockData";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

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
              {banners.map((banner) => (
                <div 
                  key={banner.id} 
                  className="w-full h-full flex-shrink-0 relative"
                >
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                    <div className="p-6 md:p-10">
                      <h2 className="text-white text-lg md:text-3xl font-bold mb-2">
                        {banner.title}
                      </h2>
                      <button className="bg-primary hover:bg-fanzon-orange-hover text-primary-foreground px-4 py-2 rounded text-sm font-medium transition-colors">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 hover:bg-card p-2 rounded-full shadow-md transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
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
            <div className="flex-1 relative rounded-lg overflow-hidden bg-gradient-to-br from-primary to-fanzon-orange-hover">
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                <p className="text-primary-foreground/80 text-xs uppercase tracking-wider">Limited Time</p>
                <h3 className="text-primary-foreground font-bold text-lg mt-1">Flash Sale</h3>
                <p className="text-primary-foreground/90 text-sm mt-2">Up to 70% Off</p>
              </div>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden bg-gradient-to-br from-fanzon-dark to-fanzon-gray">
              <div className="absolute inset-0 p-4 flex flex-col justify-center">
                <p className="text-secondary/80 text-xs uppercase tracking-wider">New Arrivals</p>
                <h3 className="text-secondary font-bold text-lg mt-1">Electronics</h3>
                <p className="text-secondary/90 text-sm mt-2">Shop Latest Tech</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;

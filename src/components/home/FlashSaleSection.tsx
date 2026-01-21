import { useState, useEffect } from "react";
import { Zap, ChevronRight, ChevronLeft, Loader2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveFlashSaleProducts } from "@/hooks/useFlashSales";
import FlashSaleProductCard from "./FlashSaleProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FlashSaleSection = () => {
  const { products, isLoading, endTime } = useActiveFlashSaleProducts();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("flash-sale-scroll");
    if (container) {
      const scrollAmount = 400;
      const newPosition = direction === "left" 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-6">
        <div className="container mx-auto flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) return null;

  return (
    <section className="bg-gradient-to-r from-destructive/10 via-destructive/5 to-primary/10 py-6 relative overflow-hidden">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,100,50,0.1),transparent_50%)] animate-pulse" />
      
      <div className="container mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-4 md:px-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="w-6 h-6 text-destructive fill-destructive animate-pulse" />
                <div className="absolute inset-0 bg-destructive/30 blur-lg rounded-full" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Flash Sale</h2>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Ends in:</span>
              <div className="flex items-center gap-1">
                <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-mono font-bold min-w-[32px] text-center">
                  {formatTime(timeLeft.hours)}
                </span>
                <span className="text-destructive font-bold">:</span>
                <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-mono font-bold min-w-[32px] text-center">
                  {formatTime(timeLeft.minutes)}
                </span>
                <span className="text-destructive font-bold">:</span>
                <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-mono font-bold min-w-[32px] text-center animate-pulse">
                  {formatTime(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/products?sale=true"
            className="flex items-center gap-1 text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
          >
            Shop All
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative group">
          {/* Left Scroll Button */}
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg",
              scrollPosition <= 0 && "hidden"
            )}
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Right Scroll Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shadow-lg"
            onClick={() => scroll("right")}
          >
            <ChevronRight size={20} />
          </Button>

          <div 
            id="flash-sale-scroll"
            className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            onScroll={(e) => setScrollPosition((e.target as HTMLElement).scrollLeft)}
          >
            <div className="flex gap-3 md:gap-4 pb-4">
              {products.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-[180px] md:w-[220px]">
                  <FlashSaleProductCard
                    product={item.product}
                    flashPrice={item.flash_price_pkr}
                    originalPrice={item.original_price_pkr}
                    stockLimit={item.stock_limit}
                    soldCount={item.sold_count}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;

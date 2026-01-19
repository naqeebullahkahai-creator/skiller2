import { useState, useEffect } from "react";
import { Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { flashSaleProducts } from "@/data/mockData";
import ProductCard from "@/components/product/ProductCard";

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 23,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <section className="bg-card py-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-4 md:px-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary fill-primary" />
              <h2 className="text-lg md:text-xl font-bold text-foreground">Flash Sale</h2>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground hidden sm:inline">Ends in:</span>
              <div className="flex items-center gap-1">
                <span className="bg-fanzon-dark text-secondary px-2 py-1 rounded text-xs font-mono font-bold">
                  {formatTime(timeLeft.hours)}
                </span>
                <span className="text-fanzon-dark font-bold">:</span>
                <span className="bg-fanzon-dark text-secondary px-2 py-1 rounded text-xs font-mono font-bold">
                  {formatTime(timeLeft.minutes)}
                </span>
                <span className="text-fanzon-dark font-bold">:</span>
                <span className="bg-fanzon-dark text-secondary px-2 py-1 rounded text-xs font-mono font-bold">
                  {formatTime(timeLeft.seconds)}
                </span>
              </div>
            </div>
          </div>
          <Link 
            to="/flash-sale" 
            className="flex items-center gap-1 text-primary hover:text-fanzon-orange-hover font-medium text-sm transition-colors"
          >
            Shop More
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-3 md:gap-4 pb-4">
            {flashSaleProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <ProductCard product={product} showStockBar />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;

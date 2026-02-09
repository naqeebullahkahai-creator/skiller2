import { useState, useEffect } from "react";
import { Zap, ChevronRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveFlashSaleProducts } from "@/hooks/useFlashSales";
import FlashSaleProductCard from "@/components/home/FlashSaleProductCard";
import { cn } from "@/lib/utils";

const MobileFlashSale = () => {
  const { products, isLoading, endTime } = useActiveFlashSaleProducts();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;
    const calc = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const fmt = (n: number) => n.toString().padStart(2, "0");
  const expired = !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds;

  if (isLoading || products.length === 0 || expired) return null;

  const isUrgent = timeLeft.hours < 2;

  return (
    <section className="mt-2">
      {/* Timer Bar */}
      <div className={cn(
        "mx-2 rounded-t-2xl px-3 py-2 flex items-center justify-between",
        isUrgent
          ? "bg-gradient-to-r from-destructive to-destructive/80"
          : "bg-gradient-to-r from-primary to-primary/80"
      )}>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-white fill-white" />
          <span className="text-white font-bold text-sm">Flash Sale</span>
          {isUrgent && <Flame size={14} className="text-yellow-300 animate-pulse" />}
        </div>
        <div className="flex items-center gap-1">
          {[fmt(timeLeft.hours), fmt(timeLeft.minutes), fmt(timeLeft.seconds)].map((v, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/80 text-xs font-bold">:</span>}
              <span className="bg-white/20 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center">
                {v}
              </span>
            </span>
          ))}
          <Link to="/products?sale=true" className="ml-2">
            <ChevronRight size={16} className="text-white/80" />
          </Link>
        </div>
      </div>

      {/* Horizontal Products */}
      <div className="mx-2 bg-card rounded-b-2xl p-2">
        <div className="overflow-x-auto scrollbar-hide -mx-1">
          <div className="flex gap-2 px-1" style={{ width: "max-content" }}>
            {products.map((item) => (
              <div key={item.id} className="w-[140px] flex-shrink-0">
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
    </section>
  );
};

export default MobileFlashSale;

import { useState, useEffect } from "react";
import { Zap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveFlashSaleProducts } from "@/hooks/useFlashSales";
import FlashSaleProductCard from "@/components/home/FlashSaleProductCard";

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

  return (
    <section className="bg-card mt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <Zap size={14} className="text-accent-foreground fill-accent-foreground" />
          </div>
          <span className="font-bold text-[14px] text-foreground">Flash Sale</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Ends in</span>
          {[fmt(timeLeft.hours), fmt(timeLeft.minutes), fmt(timeLeft.seconds)].map((v, i) => (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <span className="text-muted-foreground text-[10px] font-bold">:</span>}
              <span className="bg-foreground text-background text-[10px] font-mono font-bold px-1.5 py-0.5 rounded min-w-[22px] text-center">
                {v}
              </span>
            </span>
          ))}

          <Link to="/products?sale=true" className="ml-1 touch-target flex items-center justify-center">
            <ChevronRight size={18} className="text-primary" />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll products */}
      <div className="overflow-x-auto scrollbar-hide px-4 py-3">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {products.map((item) => (
            <div key={item.id} className="w-[128px] flex-shrink-0">
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
    </section>
  );
};

export default MobileFlashSale;

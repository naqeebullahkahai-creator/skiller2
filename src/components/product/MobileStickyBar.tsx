import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface MobileStickyBarProps {
  productTitle: string;
  price: number;
  originalPrice?: number;
  onBuyNow: () => void;
  onAddToCart: () => void;
  disabled?: boolean;
  visible?: boolean;
}

const MobileStickyBar = ({
  productTitle,
  price,
  originalPrice,
  onBuyNow,
  onAddToCart,
  disabled = false,
  visible = true,
}: MobileStickyBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-14 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom transition-transform duration-300",
      )}
      style={{ boxShadow: 'var(--shadow-3)', transform: isVisible ? 'translateY(0)' : 'translateY(100%)' }}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Price */}
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-accent">
            {formatPKR(price)}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="text-[10px] text-muted-foreground line-through">
              {formatPKR(originalPrice)}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onAddToCart}
            className="h-11 px-3 border-primary text-primary active:scale-[0.98] transition-transform touch-target rounded-xl"
          >
            <ShoppingCart size={18} />
          </Button>
          <Button
            size="sm"
            disabled={disabled}
            onClick={onBuyNow}
            className="h-11 px-5 bg-accent hover:bg-accent/90 text-accent-foreground active:scale-[0.98] transition-transform font-semibold touch-target rounded-xl"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;

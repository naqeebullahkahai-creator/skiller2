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
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show sticky bar after scrolling past 400px (past the action buttons)
      if (currentScrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!visible) return null;

  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-lg safe-area-bottom transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">
            {productTitle}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPKR(price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPKR(originalPrice!)}
                </span>
                <span className="text-xs font-medium text-fanzon-success">
                  -{discount}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onAddToCart}
            className="h-10 px-3 border-primary text-primary active:scale-[0.98] transition-transform"
          >
            <ShoppingCart size={18} />
          </Button>
          <Button
            size="sm"
            disabled={disabled}
            onClick={onBuyNow}
            className="h-10 px-4 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-transform font-semibold"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyBar;

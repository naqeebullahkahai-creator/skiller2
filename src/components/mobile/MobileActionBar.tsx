import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileActionBarProps {
  price: string;
  originalPrice?: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

const MobileActionBar = ({
  price,
  originalPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
  isWishlisted = false,
  onToggleWishlist,
}: MobileActionBarProps) => {
  return (
    <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom" style={{ boxShadow: 'var(--shadow-3)' }}>
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Wishlist */}
        {onToggleWishlist && (
          <button
            onClick={onToggleWishlist}
            className="flex-shrink-0 p-3 border border-border rounded-xl active:scale-95 transition-transform touch-target"
          >
            <Heart
              size={22}
              className={cn(
                isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>
        )}

        {/* Price */}
        <div className="flex-shrink-0 mr-2">
          <p className="text-[16px] font-bold text-accent">{price}</p>
          {originalPrice && (
            <p className="text-[10px] text-muted-foreground line-through">{originalPrice}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex-1 flex gap-2">
          <Button
            variant="outline"
            disabled={disabled}
            onClick={onAddToCart}
            className="flex-1 h-11 border-primary text-primary active:scale-[0.98] transition-transform rounded-xl touch-target"
          >
            <ShoppingCart size={18} className="mr-1" />
            Cart
          </Button>
          <Button
            disabled={disabled}
            onClick={onBuyNow}
            className="flex-1 h-11 bg-accent hover:bg-accent/90 text-accent-foreground active:scale-[0.98] transition-transform rounded-xl touch-target"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileActionBar;

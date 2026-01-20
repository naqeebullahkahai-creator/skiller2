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
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border shadow-lg safe-area-bottom">
      <div className="flex items-center gap-2 p-3">
        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={onToggleWishlist}
            className="flex-shrink-0 p-3 border border-border rounded-lg active:scale-95 transition-transform"
          >
            <Heart
              size={22}
              className={cn(
                isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>
        )}

        {/* Price Display */}
        <div className="flex-shrink-0 mr-2">
          <p className="text-lg font-bold text-primary">{price}</p>
          {originalPrice && (
            <p className="text-xs text-muted-foreground line-through">{originalPrice}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex gap-2">
          <Button
            variant="outline"
            disabled={disabled}
            onClick={onAddToCart}
            className="flex-1 h-11 border-primary text-primary active:scale-[0.98] transition-transform"
          >
            <ShoppingCart size={18} className="mr-1" />
            Cart
          </Button>
          <Button
            disabled={disabled}
            onClick={onBuyNow}
            className="flex-1 h-11 bg-primary hover:bg-primary/90 active:scale-[0.98] transition-transform"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileActionBar;

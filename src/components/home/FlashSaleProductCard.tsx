import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatPKR } from "@/hooks/useProducts";
import { Progress } from "@/components/ui/progress";

interface FlashProduct {
  id: string;
  title: string;
  images: string[] | null;
  brand: string | null;
  category: string;
}

interface FlashSaleProductCardProps {
  product: FlashProduct;
  flashPrice: number;
  originalPrice: number;
  stockLimit: number;
  soldCount: number;
}

const FlashSaleProductCard = ({
  product,
  flashPrice,
  originalPrice,
  stockLimit,
  soldCount,
}: FlashSaleProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate discount percentage
  const discount = Math.round(((originalPrice - flashPrice) / originalPrice) * 100);

  // Get first image or placeholder
  const image = product.images && product.images.length > 0
    ? product.images[0]
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

  // Calculate sold percentage
  const soldPercentage = Math.min(100, (soldCount / stockLimit) * 100);
  const remainingStock = Math.max(0, stockLimit - soldCount);
  const isAlmostSoldOut = soldPercentage >= 80;
  const isSoldOut = remainingStock <= 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className={cn(
            "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
            isSoldOut && "opacity-50"
          )}
        />

        {/* Flash Sale Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg">
            <Zap size={10} className="fill-current" />
            FLASH
          </div>
          <div className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded shadow-lg">
            -{discount}%
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 right-2 p-1.5 bg-card/80 hover:bg-card rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            size={16}
            className={cn(
              "transition-colors",
              isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Quick Add - Link to product page */}
        {!isSoldOut && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <span className="w-full bg-destructive text-destructive-foreground text-xs font-medium py-2 rounded flex items-center justify-center gap-1">
              <ShoppingCart size={14} />
              View Deal
            </span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-sm">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-[10px] text-muted-foreground mb-1 truncate">
          {product.brand || "FANZON"}
        </p>

        {/* Title */}
        <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 mb-2 flex-1">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-base md:text-lg font-bold text-destructive">
            {formatPKR(flashPrice)}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatPKR(originalPrice)}
          </span>
        </div>

        {/* Stock Progress Bar */}
        <div className="space-y-1">
          <Progress 
            value={soldPercentage} 
            className={cn(
              "h-2",
              isAlmostSoldOut ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
            )}
          />
          <div className="flex items-center justify-between text-[10px]">
            <span className={cn(
              "font-medium",
              isAlmostSoldOut ? "text-destructive" : "text-muted-foreground"
            )}>
              {Math.round(soldPercentage)}% Sold
            </span>
            <span className={cn(
              isAlmostSoldOut ? "text-destructive font-semibold" : "text-muted-foreground"
            )}>
              {remainingStock > 0 ? `${remainingStock} left` : "Sold Out"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FlashSaleProductCard;

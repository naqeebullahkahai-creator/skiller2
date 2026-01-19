import { Heart, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: DatabaseProduct;
  showStockBar?: boolean;
}

const ProductCard = ({ product, showStockBar = false }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  
  // Calculate discount percentage
  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  // Get display price
  const displayPrice = product.discount_price_pkr || product.price_pkr;
  
  // Get first image or placeholder
  const image = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

  // Calculate stock percentage (for display purposes)
  const stockSold = Math.max(0, 100 - product.stock_count);
  const stockPercentage = Math.min(90, stockSold); // Cap at 90% for visual effect

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </div>
        )}

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

        {/* Quick Add to Cart - Desktop Only */}
        {product.stock_count > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full bg-primary hover:bg-fanzon-orange-hover text-primary-foreground text-xs font-medium py-2 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <ShoppingCart size={14} />
              Add to Cart
            </button>
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

        {/* Rating placeholder - using static data for now */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-fanzon-star text-fanzon-star" />
          <span className="text-[10px] md:text-xs text-muted-foreground">
            4.5 (100+)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm md:text-base font-bold text-primary">
            {formatPKR(displayPrice)}
          </span>
          {discount > 0 && (
            <span className="text-[10px] md:text-xs text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </span>
          )}
        </div>

        {/* Stock Progress Bar */}
        {showStockBar && (
          <div className="mt-2">
            <div className="h-1.5 bg-fanzon-orange-light rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {product.stock_count} left
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

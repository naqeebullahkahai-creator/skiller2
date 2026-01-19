import { Heart, Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  showStockBar?: boolean;
}

const ProductCard = ({ product, showStockBar = false }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const stockPercentage = (product.stockSold / product.stockTotal) * 100;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">
            -{product.discount}%
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
            className="w-full bg-primary hover:bg-fanzon-orange-hover text-primary-foreground text-xs font-medium py-2 rounded flex items-center justify-center gap-1 transition-colors"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Vendor */}
        <p className="text-[10px] text-muted-foreground mb-1 truncate">
          {product.vendor}
        </p>

        {/* Title */}
        <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 mb-2 flex-1">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-fanzon-star text-fanzon-star" />
          <span className="text-[10px] md:text-xs text-muted-foreground">
            {product.rating} ({product.ratingCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm md:text-base font-bold text-primary">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] md:text-xs text-muted-foreground line-through">
              ৳{product.originalPrice.toLocaleString()}
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
              {product.stockSold} sold
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

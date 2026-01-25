import { memo, useState } from "react";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import LazyImage from "@/components/ui/lazy-image";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: DatabaseProduct;
  showStockBar?: boolean;
  priority?: boolean;
}

const ProductCard = memo(({ product, showStockBar = false, priority = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  const displayPrice = product.discount_price_pkr || product.price_pkr;
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded border border-border hover:shadow-md transition-shadow duration-200 overflow-hidden block"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <LazyImage
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm">
            -{discount}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </button>

        {/* Low Stock */}
        {product.stock_count > 0 && product.stock_count <= 5 && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
            Only {product.stock_count} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        {/* Title */}
        <h3 className="text-xs text-foreground line-clamp-2 mb-1.5 min-h-[32px] leading-tight">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mb-1.5">
          <p className="text-sm font-bold text-primary">
            {formatPKR(displayPrice)}
          </p>
          {discount > 0 && (
            <p className="text-[10px] text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={cn(
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">(120)</span>
        </div>

        {/* Free Shipping Tag */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
            Free Shipping
          </span>
        </div>

        {/* Add to Cart - Desktop */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock_count === 0}
          className={cn(
            "hidden md:flex w-full mt-2 items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors",
            product.stock_count > 0
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <ShoppingCart size={12} />
          {product.stock_count > 0 ? "Add to Cart" : "Out of Stock"}
        </button>

        {/* Stock Bar */}
        {showStockBar && product.stock_count > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, (product.stock_count / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">{product.stock_count} items left</p>
          </div>
        )}
      </div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;

import { memo } from "react";
import { Star, Heart, ShoppingCart, MapPin, Truck } from "lucide-react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
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
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

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
    toggleWishlist(product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-2xl border border-border/60 hover:shadow-xl hover:border-border hover:-translate-y-0.5 transition-all duration-300 overflow-hidden block"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-secondary overflow-hidden rounded-t-2xl">
        <LazyImage
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          priority={priority}
        />
        
        {/* Free Delivery Badge */}
        {product.free_shipping && (
          <div className="absolute top-2 left-2 bg-fanzon-success text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 z-10 shadow-sm">
            <Truck size={10} />
            FREE DELIVERY
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className={cn(
            "absolute left-2 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full shadow-sm",
            product.free_shipping ? "top-8" : "top-2"
          )}>
            -{discount}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-card transition-all"
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
        </button>

        {/* Low Stock */}
        {product.stock_count > 0 && product.stock_count <= 5 && (
          <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-[9px] font-medium px-2 py-0.5 rounded-full shadow-sm">
            Only {product.stock_count} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-xs text-foreground line-clamp-2 mb-2 min-h-[32px] leading-relaxed font-medium">
          {product.title}
        </h3>

        {/* Price & Sold */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-bold text-primary">
            {formatPKR(displayPrice)}
          </p>
          {product.sold_count > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {product.sold_count} sold
            </span>
          )}
        </div>
        {discount > 0 && (
          <p className="text-[10px] text-muted-foreground line-through mb-1">
            {formatPKR(product.price_pkr)}
          </p>
        )}

        {/* Rating & Location */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center gap-0.5">
            <Star size={10} className="fill-fanzon-star text-fanzon-star" />
            <span className="text-[10px] text-muted-foreground font-medium">4.5</span>
          </div>
          {product.location && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin size={9} />
              <span className="text-[10px]">{product.location}</span>
            </div>
          )}
        </div>

        {/* Add to Cart - Desktop */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock_count === 0}
          className={cn(
            "hidden md:flex w-full items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
            product.stock_count > 0
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <ShoppingCart size={12} />
          {product.stock_count > 0 ? "Add to Cart" : "Out of Stock"}
        </button>

        {/* Stock Bar */}
        {showStockBar && product.stock_count > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
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

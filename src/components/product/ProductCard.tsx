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
      className="group bg-card rounded-2xl border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden block relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        <LazyImage
          src={image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          priority={priority}
        />
        
        {/* Badges — top left stack */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.free_shipping && (
            <span className="bg-fanzon-success text-accent-foreground text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm">
              <Truck size={10} />
              FREE
            </span>
          )}
          {discount > 0 && (
            <Badge className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-lg shadow-sm border-0">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all z-10",
            isWishlisted 
              ? "bg-destructive/10 backdrop-blur-sm" 
              : "bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100"
          )}
        >
          <Heart
            size={14}
            className={cn(
              "transition-colors",
              isWishlisted ? "fill-destructive text-destructive" : "text-foreground/60"
            )}
          />
        </button>

        {/* Quick Add — slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2 bg-gradient-to-t from-foreground/60 to-transparent">
          <button
            onClick={handleAddToCart}
            disabled={product.stock_count === 0}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all",
              product.stock_count > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ShoppingCart size={13} />
            {product.stock_count > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>

        {/* Low Stock */}
        {product.stock_count > 0 && product.stock_count <= 5 && (
          <div className="absolute bottom-2 left-2 bg-destructive/90 text-destructive-foreground text-[9px] font-medium px-2 py-0.5 rounded-lg shadow-sm group-hover:opacity-0 transition-opacity">
            Only {product.stock_count} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-[13px] text-foreground/85 line-clamp-2 mb-2 min-h-[36px] leading-relaxed font-medium">
          {product.title}
        </h3>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-1">
          <p className="text-[15px] font-bold text-primary">
            {formatPKR(displayPrice)}
          </p>
          {discount > 0 && (
            <p className="text-[11px] text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </p>
          )}
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-0.5">
            <Star size={11} className="fill-fanzon-star text-fanzon-star" />
            <span className="text-[11px] text-muted-foreground font-medium">4.5</span>
          </div>
          {product.sold_count > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {product.sold_count} sold
            </span>
          )}
          {product.location && (
            <div className="flex items-center gap-0.5 text-muted-foreground ml-auto">
              <MapPin size={9} />
              <span className="text-[10px]">{product.location}</span>
            </div>
          )}
        </div>

        {/* Stock Bar */}
        {showStockBar && product.stock_count > 0 && (
          <div className="mt-2.5">
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

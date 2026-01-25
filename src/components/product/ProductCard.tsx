import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo, useState } from "react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import AddToCompareButton from "@/components/comparison/AddToCompareButton";
import LazyImage from "@/components/ui/lazy-image";
import PrefetchLink from "@/components/product/PrefetchLink";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: DatabaseProduct;
  showStockBar?: boolean;
  priority?: boolean;
}

const ProductCard = memo(({ product, showStockBar = false, priority = false }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  const displayPrice = product.discount_price_pkr || product.price_pkr;
  
  const image = product.images && product.images.length > 0 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop";

  const stockPercentage = Math.min(90, Math.max(0, 100 - product.stock_count));
  const productUrl = `/product/${product.slug || product.id}`;

  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        <PrefetchLink to={productUrl} productId={product.slug || product.id} className="block w-full h-full">
          <LazyImage
            src={image}
            alt={product.title}
            priority={priority}
            width={300}
            height={300}
            aspectRatio="square"
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
          />
        </PrefetchLink>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <Badge className="bg-primary text-primary-foreground font-bold shadow-lg">
              -{discount}%
            </Badge>
          )}
          {product.stock_count <= 5 && product.stock_count > 0 && (
            <Badge variant="destructive" className="font-medium shadow-lg">
              Only {product.stock_count} left
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 z-10",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        )}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className={cn(
              "p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200",
              isWishlisted 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-white/90 hover:bg-white text-muted-foreground hover:text-destructive"
            )}
          >
            <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
          </button>
          <AddToCompareButton product={product} variant="icon" />
          <PrefetchLink 
            to={productUrl} 
            productId={product.slug || product.id}
            className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-lg backdrop-blur-sm text-muted-foreground hover:text-primary transition-all duration-200"
          >
            <Eye size={18} />
          </PrefetchLink>
        </div>

        {/* Add to Cart - Desktop */}
        {product.stock_count > 0 && (
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 hidden md:block z-10",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <PrefetchLink 
        to={productUrl} 
        productId={product.slug || product.id}
        className="p-4 flex flex-col flex-1"
      >
        {/* Brand */}
        <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">
          {product.brand || "FANZON"}
        </p>

        {/* Title */}
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 flex-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                className={cn(
                  star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                )} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">(100+)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-primary">
            {formatPKR(displayPrice)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </span>
          )}
        </div>

        {/* Stock Bar */}
        {showStockBar && (
          <div className="mt-3">
            <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
              {product.stock_count} items left
            </p>
          </div>
        )}
      </PrefetchLink>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;

import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

interface MobileProductCardProps {
  product: DatabaseProduct;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const { addToCart } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  
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

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-card rounded-2xl overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={image}
          alt={product.title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-1.5 right-1.5 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ShoppingCart size={14} />
        </button>

        {/* Low Stock */}
        {product.stock_count > 0 && product.stock_count <= 5 && (
          <div className="absolute bottom-1.5 left-1.5 bg-destructive/90 text-destructive-foreground text-[9px] font-medium px-1.5 py-0.5 rounded-full">
            {product.stock_count} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-[11px] text-foreground line-clamp-2 mb-1 leading-tight">
          {product.title}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-primary">
              {formatPKR(displayPrice)}
            </p>
            {discount > 0 && (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatPKR(product.price_pkr)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Star size={10} className="fill-fanzon-star text-fanzon-star" />
            <span className="text-[10px] text-muted-foreground">4.5</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MobileProductCard;

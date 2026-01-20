import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface MobileProductCardProps {
  product: DatabaseProduct;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  const displayPrice = product.discount_price_pkr || product.price_pkr;
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-card rounded-lg overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted">
        <img
          src={image}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </div>
        )}

        {/* Low Stock Badge */}
        {product.stock_count > 0 && product.stock_count <= 5 && (
          <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
            Only {product.stock_count} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        {/* Title */}
        <h3 className="text-xs text-foreground line-clamp-2 mb-1.5 leading-tight">
          {product.title}
        </h3>

        {/* Price */}
        <div className="space-y-0.5">
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
        <div className="flex items-center gap-1 mt-1.5">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-muted-foreground">4.5 (120)</span>
        </div>
      </div>
    </Link>
  );
};

export default MobileProductCard;

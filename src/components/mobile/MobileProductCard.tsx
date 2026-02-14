import { Link } from "react-router-dom";
import { Star, MapPin, Truck } from "lucide-react";
import { DatabaseProduct, formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MobileProductCardProps {
  product: DatabaseProduct;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const discount = product.discount_price_pkr && product.discount_price_pkr < product.price_pkr
    ? Math.round(((product.price_pkr - product.discount_price_pkr) / product.price_pkr) * 100)
    : 0;

  const displayPrice = product.discount_price_pkr || product.price_pkr;
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-card rounded-lg overflow-hidden shadow-sm active:scale-[0.97] transition-all duration-200 block"
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
        
        {/* Free Delivery Badge */}
        {product.free_shipping && (
          <div className="absolute top-1.5 left-1.5 bg-[#00a862] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Truck size={10} />
            FREE DELIVERY
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="text-[11px] text-foreground line-clamp-2 mb-1 leading-tight min-h-[28px]">
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

        {/* Original Price */}
        {discount > 0 && (
          <p className="text-[10px] text-muted-foreground line-through mb-0.5">
            {formatPKR(product.price_pkr)}
          </p>
        )}

        {/* Rating & Location */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center gap-0.5">
            <Star size={10} className="fill-fanzon-star text-fanzon-star" />
            <span className="text-[10px] text-muted-foreground">4.5</span>
          </div>
          {product.location && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin size={9} />
              <span className="text-[10px]">{product.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MobileProductCard;

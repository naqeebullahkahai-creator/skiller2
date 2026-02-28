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
      className="bg-card overflow-hidden block active:opacity-90 transition-opacity border border-border/50"
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
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer" />}

        {/* Free Delivery */}
        {product.free_shipping && (
          <div className="absolute top-0 left-0 bg-fanzon-success text-white text-[8px] font-bold px-1.5 py-[2px] flex items-center gap-0.5">
            <Truck size={8} />
            Free Delivery
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-[2px]">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 space-y-1">
        <h3 className="text-[11px] text-foreground line-clamp-2 leading-snug min-h-[30px]">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-primary font-bold text-sm leading-none">
          {formatPKR(displayPrice)}
        </p>

        {/* Original Price + Discount */}
        {discount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </span>
            <span className="text-[10px] text-primary font-semibold">
              -{discount}%
            </span>
          </div>
        )}

        {/* Rating + Sold + Location */}
        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          <div className="flex items-center gap-0.5">
            <Star size={9} className="fill-fanzon-star text-fanzon-star" />
            <span className="text-[9px] text-muted-foreground">4.5</span>
          </div>
          {product.sold_count > 0 && (
            <span className="text-[9px] text-muted-foreground">
              · {product.sold_count} sold
            </span>
          )}
          {product.location && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              · <MapPin size={7} /> {product.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MobileProductCard;

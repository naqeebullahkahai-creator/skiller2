import { Link } from "react-router-dom";
import { Star, Truck } from "lucide-react";
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
      className="bg-card overflow-hidden block active:opacity-90 transition-opacity rounded-xl"
      style={{ boxShadow: 'var(--shadow-1)' }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {/* Blur-up placeholder */}
        <img
          src={image}
          alt=""
          aria-hidden
          className={cn(
            "absolute inset-0 w-full h-full object-cover scale-110 blur-lg transition-opacity duration-500",
            imgLoaded ? "opacity-0" : "opacity-60"
          )}
          loading="lazy"
        />
        <img
          src={image}
          alt={product.title}
          className={cn(
            "relative w-full h-full object-cover transition-opacity duration-300",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer rounded-t-xl" />}

        {/* Free Delivery badge */}
        {product.free_shipping && (
          <div className="absolute top-0 left-0 bg-fanzon-success text-primary-foreground text-[9px] font-bold px-2 py-[3px] flex items-center gap-0.5 rounded-br-lg">
            <Truck size={10} />
            Free
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-[3px] rounded-bl-lg">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content — 8px padding */}
      <div className="p-2 space-y-1">
        <h3 className="text-[12px] text-foreground line-clamp-2 leading-snug min-h-[32px]">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-accent font-bold text-[14px] leading-none">
          {formatPKR(displayPrice)}
        </p>

        {/* Original Price + Discount */}
        {discount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPKR(product.price_pkr)}
            </span>
          </div>
        )}

        {/* Rating + Sold */}
        <div className="flex items-center gap-1 pt-0.5">
          <Star size={10} className="fill-fanzon-star text-fanzon-star" />
          <span className="text-[10px] text-muted-foreground">4.5</span>
          {product.sold_count > 0 && (
            <span className="text-[10px] text-muted-foreground">
              · {product.sold_count} sold
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MobileProductCard;

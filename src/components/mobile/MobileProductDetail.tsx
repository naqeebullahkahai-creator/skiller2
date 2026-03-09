import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star, Heart, Minus, Plus, ShoppingCart, Truck, Shield,
  RotateCcw, Store, Package, ChevronLeft, Share2, ChevronDown, ChevronUp,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/hooks/useProducts";
import { ProductVariant } from "@/hooks/useProductVariants";
import VariantSelector from "@/components/product/VariantSelector";
import ProductReviews from "@/components/product/ProductReviews";
import ProductQASection from "@/components/product/ProductQASection";
import ChatWithSellerButton from "@/components/messaging/ChatWithSellerButton";
import SocialShareButtons from "@/components/product/SocialShareButtons";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

interface MobileProductDetailProps {
  product: any;
  images: string[];
  displayPrice: number;
  discount: number;
  availableStock: number;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isAddingToCart: boolean;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  hasVariants: boolean;
  needsVariantSelection: boolean;
  groupedVariants: Record<string, ProductVariant[]>;
  selectedVariants: Record<string, ProductVariant | null>;
  onVariantSelect: (name: string, variant: ProductVariant) => void;
  selectedVariant: ProductVariant | null;
  reviewStats: { averageRating: number; totalReviews: number };
  sellerName?: string;
}

const MobileProductDetail = ({
  product,
  images,
  displayPrice,
  discount,
  availableStock,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isAddingToCart,
  isWishlisted,
  onToggleWishlist,
  hasVariants,
  needsVariantSelection,
  groupedVariants,
  selectedVariants,
  onVariantSelect,
  selectedVariant,
  reviewStats,
  sellerName = "FANZON Seller",
}: MobileProductDetailProps) => {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useState(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 h-12 safe-area-top">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 touch-target active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onToggleWishlist} className="p-2 touch-target active:scale-90 transition-transform">
            <Heart size={22} className={cn(isWishlisted ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
          <SocialShareButtons
            productName={product.title}
            productUrl={`/product/${product.id}`}
            productPrice={displayPrice}
            compact
          />
        </div>
      </div>

      {/* Image Gallery Swiper */}
      <div className="relative bg-card">
        {(() => {
          // Use variant images if available
          const displayImages = selectedVariant?.image_urls?.length 
            ? selectedVariant.image_urls 
            : images;
          return (
            <>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {displayImages.map((img, i) => (
                    <div key={i} className="flex-[0_0_100%] min-w-0">
                      <div className="aspect-square bg-muted">
                        <img src={img} alt={product.title} className="w-full h-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {displayImages.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-[6px] rounded-full transition-all duration-300",
                        i === selectedIndex ? "w-5 bg-primary" : "w-[6px] bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              <div className="absolute top-3 right-3 bg-foreground/60 text-background text-[10px] font-medium px-2 py-1 rounded-full">
                {selectedIndex + 1}/{displayImages.length}
              </div>
            </>
          );
        })()}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-[12px] font-bold px-2.5 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="bg-card px-4 py-3 mt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[24px] font-bold text-accent">{formatPKR(displayPrice)}</span>
          {discount > 0 && (
            <>
              <span className="text-[14px] text-muted-foreground line-through">{formatPKR(product.price_pkr)}</span>
              <span className="text-[12px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">-{discount}%</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-[15px] text-foreground leading-snug mt-2">{product.title}</h1>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} className={cn(s <= Math.round(reviewStats.averageRating) ? "fill-fanzon-star text-fanzon-star" : "text-muted-foreground")} />
            ))}
          </div>
          <span className="text-[12px] text-muted-foreground">
            {reviewStats.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : "No ratings"} · {reviewStats.totalReviews} reviews
          </span>
          {product.sold_count > 0 && (
            <span className="text-[12px] text-muted-foreground">· {product.sold_count} sold</span>
          )}
        </div>
      </div>

      {/* Variants */}
      {hasVariants && (
        <div className="bg-card px-4 py-3 mt-1">
          <VariantSelector
            groupedVariants={groupedVariants}
            selectedVariants={selectedVariants}
            onVariantSelect={onVariantSelect}
          />
        </div>
      )}

      {/* Quantity */}
      {availableStock > 0 && (
        <div className="bg-card px-4 py-3 mt-1 flex items-center justify-between">
          <span className="text-[14px] font-medium text-foreground">Quantity</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => onQuantityChange(-1)} disabled={quantity <= 1} className="p-2 touch-target disabled:opacity-40">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center font-medium text-[14px]">{quantity}</span>
              <button onClick={() => onQuantityChange(1)} disabled={quantity >= availableStock} className="p-2 touch-target disabled:opacity-40">
                <Plus size={16} />
              </button>
            </div>
            <span className="text-[12px] text-muted-foreground">{availableStock} available</span>
          </div>
        </div>
      )}

      {/* Delivery Info */}
      <div className="bg-card px-4 py-3 mt-1">
        <h3 className="text-[14px] font-semibold text-foreground mb-3">Delivery</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Truck size={18} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-foreground">Standard Delivery · Rs. 150</p>
              <p className="text-[11px] text-muted-foreground">Estimated 3-5 business days</p>
            </div>
          </div>
          {product.free_shipping && (
            <div className="flex items-center gap-3">
              <Truck size={18} className="text-primary flex-shrink-0" />
              <p className="text-[13px] font-medium text-primary">Free Shipping</p>
            </div>
          )}
        </div>
      </div>

      {/* Seller */}
      <div className="bg-card px-4 py-3 mt-1">
        <div className="flex items-center justify-between">
          <Link to={`/store/${product.seller_id}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Store size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-primary">{sellerName}</p>
              <p className="text-[11px] text-muted-foreground">Visit Store →</p>
            </div>
          </Link>
          <ChatWithSellerButton
            sellerId={product.seller_id}
            productId={product.id}
            productTitle={product.title}
            sellerName={sellerName}
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-card px-4 py-3 mt-1">
        <button
          onClick={() => setDescExpanded(!descExpanded)}
          className="w-full flex items-center justify-between touch-target"
        >
          <h3 className="text-[14px] font-semibold text-foreground">Description</h3>
          {descExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </button>
        {descExpanded && (
          <p className="text-[13px] text-foreground/80 mt-3 whitespace-pre-wrap leading-relaxed">
            {product.description || "No description available."}
          </p>
        )}
      </div>

      {/* Guarantees */}
      <div className="bg-card px-4 py-3 mt-1">
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-1">
            <Shield size={20} className="text-primary" />
            <span className="text-[10px] text-muted-foreground text-center">Authentic</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <RotateCcw size={20} className="text-primary" />
            <span className="text-[10px] text-muted-foreground text-center">7-Day Return</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Package size={20} className="text-primary" />
            <span className="text-[10px] text-muted-foreground text-center">Secure Pack</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-card px-4 py-3 mt-1">
        <h3 className="text-[14px] font-semibold text-foreground mb-3">Reviews & Ratings</h3>
        <ProductReviews productId={product.id} />
      </div>

      {/* Q&A */}
      <div className="bg-card px-4 py-3 mt-1">
        <ProductQASection
          productId={product.id}
          sellerId={product.seller_id}
          productTitle={product.title}
        />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom" style={{ boxShadow: 'var(--shadow-3)' }}>
        <div className="flex items-center gap-2 px-4 py-2">
          <button onClick={onToggleWishlist} className="p-2.5 touch-target active:scale-90 transition-transform">
            <Heart size={22} className={cn(isWishlisted ? "fill-destructive text-destructive" : "text-muted-foreground")} />
          </button>
          <Button
            variant="outline"
            onClick={onAddToCart}
            disabled={availableStock === 0 || needsVariantSelection || isAddingToCart}
            className="flex-1 h-11 border-primary text-primary active:scale-[0.98] transition-transform touch-target rounded-xl gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </Button>
          <Button
            onClick={onBuyNow}
            disabled={availableStock === 0 || needsVariantSelection || isAddingToCart}
            className="flex-1 h-11 bg-accent hover:bg-accent/90 text-accent-foreground active:scale-[0.98] transition-transform font-semibold touch-target rounded-xl"
          >
            {needsVariantSelection ? "Select Option" : "Buy Now"}
          </Button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default MobileProductDetail;

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/contexts/CartContext";
import { formatPKR } from "@/hooks/useProducts";
import SwipeToDelete from "./SwipeToDelete";

interface MobileCartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemove: (productId: string, variantId?: string) => void;
}

const MobileCartItem = ({ item, onUpdateQuantity, onRemove }: MobileCartItemProps) => {
  const { product, quantity, selectedVariant: variant } = item;
  const displayPrice = (product.discount_price_pkr || product.price_pkr) + (variant?.additional_price_pkr || 0);
  const image = product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop";

  return (
    <SwipeToDelete onDelete={() => onRemove(product.id, variant?.id)}>
      <div className="flex gap-3 p-3 bg-card">
        {/* Product Image */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h4>
          {variant && (
            <p className="text-xs text-muted-foreground mb-1">
              {variant.variant_name}: {variant.variant_value}
            </p>
          )}
          <p className="text-sm font-bold text-primary">{formatPKR(displayPrice)}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-col items-end justify-between">
          <button
            onClick={() => onRemove(product.id, variant?.id)}
            className="p-1 text-muted-foreground active:text-destructive"
          >
            <Trash2 size={16} />
          </button>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg">
            <button
              onClick={() => onUpdateQuantity(product.id, quantity - 1, variant?.id)}
              disabled={quantity <= 1}
              className="p-1.5 disabled:opacity-50 active:bg-muted-foreground/20 rounded-l-lg"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1, variant?.id)}
              className="p-1.5 active:bg-muted-foreground/20 rounded-r-lg"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </SwipeToDelete>
  );
};

export default MobileCartItem;

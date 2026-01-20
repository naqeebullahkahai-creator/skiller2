import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DatabaseProduct } from "@/hooks/useProducts";
import { ProductVariant } from "@/hooks/useProductVariants";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  product: DatabaseProduct;
  quantity: number;
  selectedVariant?: ProductVariant | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: DatabaseProduct, quantity?: number, variant?: ProductVariant | null) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getItemCount: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "fanzon_cart";
const SHIPPING_FEE = 150;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Generate unique key for cart item (product + variant combination)
  const getCartItemKey = (productId: string, variantId?: string) => {
    return variantId ? `${productId}-${variantId}` : productId;
  };

  const addToCart = (product: DatabaseProduct, quantity: number = 1, variant?: ProductVariant | null) => {
    // Check stock based on variant or product
    const availableStock = variant ? variant.stock_count : product.stock_count;
    
    if (availableStock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${availableStock} items available.`,
        variant: "destructive",
      });
      return;
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => 
        item.product.id === product.id && 
        (item.selectedVariant?.id || null) === (variant?.id || null)
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
          toast({
            title: "Maximum Stock Reached",
            description: `Only ${availableStock} items available.`,
            variant: "destructive",
          });
          return prev;
        }
        
        toast({
          title: "Cart Updated",
          description: `${product.title}${variant ? ` (${variant.variant_value})` : ""} quantity updated to ${newQuantity}.`,
        });
        
        return prev.map((item) =>
          item.product.id === product.id && 
          (item.selectedVariant?.id || null) === (variant?.id || null)
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      toast({
        title: "Added to Cart",
        description: `${product.title}${variant ? ` (${variant.variant_value})` : ""} added to your cart.`,
      });

      return [...prev, { product, quantity, selectedVariant: variant || null }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems((prev) => {
      const item = prev.find((i) => 
        i.product.id === productId && 
        (i.selectedVariant?.id || undefined) === variantId
      );
      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.product.title}${item.selectedVariant ? ` (${item.selectedVariant.variant_value})` : ""} removed from your cart.`,
        });
      }
      return prev.filter((item) => 
        !(item.product.id === productId && 
          (item.selectedVariant?.id || undefined) === variantId)
      );
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }

    setItems((prev) => {
      const item = prev.find((i) => 
        i.product.id === productId && 
        (i.selectedVariant?.id || undefined) === variantId
      );
      
      if (item) {
        const availableStock = item.selectedVariant 
          ? item.selectedVariant.stock_count 
          : item.product.stock_count;
        
        if (quantity > availableStock) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${availableStock} items available.`,
            variant: "destructive",
          });
          return prev;
        }
      }

      return prev.map((item) =>
        item.product.id === productId && 
        (item.selectedVariant?.id || undefined) === variantId
          ? { ...item, quantity } 
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const basePrice = item.product.discount_price_pkr || item.product.price_pkr;
      const additionalPrice = item.selectedVariant?.additional_price_pkr || 0;
      return total + (basePrice + additionalPrice) * item.quantity;
    }, 0);
  };

  const getShippingFee = () => {
    return items.length > 0 ? SHIPPING_FEE : 0;
  };

  const getCartTotal = () => {
    return getSubtotal() + getShippingFee();
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId: string, variantId?: string) => {
    return items.some((item) => 
      item.product.id === productId && 
      (item.selectedVariant?.id || undefined) === variantId
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getSubtotal,
        getShippingFee,
        getItemCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

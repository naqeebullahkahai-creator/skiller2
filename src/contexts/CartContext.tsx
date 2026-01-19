import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DatabaseProduct } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  product: DatabaseProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: DatabaseProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
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

  const addToCart = (product: DatabaseProduct, quantity: number = 1) => {
    if (product.stock_count < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock_count} items available.`,
        variant: "destructive",
      });
      return;
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock_count) {
          toast({
            title: "Maximum Stock Reached",
            description: `Only ${product.stock_count} items available.`,
            variant: "destructive",
          });
          return prev;
        }
        
        toast({
          title: "Cart Updated",
          description: `${product.title} quantity updated to ${newQuantity}.`,
        });
        
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      toast({
        title: "Added to Cart",
        description: `${product.title} added to your cart.`,
      });

      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.product.title} removed from your cart.`,
        });
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item && quantity > item.product.stock_count) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${item.product.stock_count} items available.`,
          variant: "destructive",
        });
        return prev;
      }

      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
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
      const price = item.product.discount_price_pkr || item.product.price_pkr;
      return total + price * item.quantity;
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

  const isInCart = (productId: string) => {
    return items.some((item) => item.product.id === productId);
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

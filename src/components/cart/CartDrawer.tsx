import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPKR } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";

interface CartDrawerProps {
  children?: React.ReactNode;
}

const CartDrawer = ({ children }: CartDrawerProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getShippingFee,
    getCartTotal,
    getItemCount,
  } = useCart();

  const handleCheckout = () => {
    setOpen(false);
    if (!user) {
      navigate("/auth?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <button className="relative p-2 hover:bg-muted rounded-full">
            <ShoppingCart size={22} className="text-foreground" />
            {getItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Shopping Cart ({getItemCount()})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const price =
                  item.product.discount_price_pkr || item.product.price_pkr;
                const image =
                  item.product.images?.[0] ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop";

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={() => setOpen(false)}
                      className="flex-shrink-0"
                    >
                      <img
                        src={image}
                        alt={item.product.title}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-medium line-clamp-2 hover:text-primary"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-primary font-semibold mt-1">
                        {formatPKR(price)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-border rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-muted"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock_count}
                            className="p-1 hover:bg-muted disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPKR(getSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPKR(getShippingFee())}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatPKR(getCartTotal())}</span>
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-col pt-4">
              <Button onClick={handleCheckout} className="w-full">
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full text-destructive hover:text-destructive"
              >
                Clear Cart
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

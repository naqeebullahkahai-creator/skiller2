import { Home, Grid3X3, ShoppingCart, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";

const MobileBottomNav = () => {
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();
  const { wishlistItems } = useWishlist();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems?.length ?? 0;

  const navItems = [
    { icon: Home, label: "Home", path: "/", requiresAuth: false },
    { icon: Grid3X3, label: "Categories", path: "/categories", requiresAuth: false },
    { icon: ShoppingCart, label: "Cart", path: "/checkout", isCenter: true, requiresAuth: false },
    { icon: Heart, label: "Wishlist", path: "/account/wishlist", requiresAuth: true },
    { icon: User, label: "Account", path: "/account", requiresAuth: true },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setAuthModalMode("login");
      setShowAuthModal(true);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isCartCenter = item.isCenter;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative",
                  "active:scale-[0.92] transition-all duration-150"
                )}
              >
                {isCartCenter ? (
                  <div className="relative -mt-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg border-[3px] border-card">
                    <item.icon size={20} className="text-primary-foreground" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-accent text-accent-foreground text-[9px] font-bold rounded-full px-1">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.5 : 1.8}
                      className={cn(
                        "transition-colors duration-150",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {item.label === "Wishlist" && wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] flex items-center justify-center bg-primary text-primary-foreground text-[8px] font-bold rounded-full px-0.5">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </div>
                )}
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-150",
                  isCartCenter ? "mt-0.5" : "mt-0.5",
                  active ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;

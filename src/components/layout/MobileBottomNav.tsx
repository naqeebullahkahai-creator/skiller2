import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
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
    { icon: Home, label: "Home", path: "/", isCenter: false },
    { icon: Search, label: "Search", path: "/products", isCenter: false },
    { icon: ShoppingCart, label: "Cart", path: "/checkout", badge: cartCount > 0 ? cartCount : undefined, isCenter: true },
    { icon: Heart, label: "Wishlist", path: "/account/wishlist", badge: wishlistCount > 0 ? wishlistCount : undefined, requiresAuth: true, isCenter: false },
    { icon: User, label: "Account", path: "/account", requiresAuth: true, isCenter: false },
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
      <div className="bg-card/90 backdrop-blur-xl border-t border-border/50">
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
                  "active:scale-[0.92] transition-all duration-200",
                  isCartCenter && "-mt-4"
                )}
              >
                <div className={cn(
                  "relative",
                  isCartCenter && "w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-primary"
                )}>
                  <item.icon
                    size={isCartCenter ? 20 : 20}
                    strokeWidth={active && !isCartCenter ? 2.5 : 1.8}
                    className={cn(
                      "transition-all duration-200",
                      isCartCenter 
                        ? "text-primary-foreground" 
                        : active 
                          ? "text-primary" 
                          : "text-muted-foreground"
                    )}
                  />
                  {item.badge && (
                    <span className={cn(
                      "absolute min-w-[14px] h-3.5 flex items-center justify-center text-white text-[9px] font-bold rounded-full px-0.5",
                      isCartCenter 
                        ? "-top-0.5 -right-0.5 bg-destructive" 
                        : "-top-1 -right-2 bg-primary"
                    )}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isCartCenter ? "mt-0.5 text-primary font-semibold" : "mt-0.5",
                  !isCartCenter && (active ? "text-primary font-semibold" : "text-muted-foreground")
                )}>
                  {item.label}
                </span>
                
                {active && !isCartCenter && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;

import { Home, Grid3X3, ShoppingCart, Package, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: "Home", path: "/", requiresAuth: false },
    { icon: Grid3X3, label: "Categories", path: "/categories", requiresAuth: false },
    { icon: ShoppingCart, label: "Cart", path: "/checkout", isCenter: true, requiresAuth: false },
    { icon: Package, label: "Orders", path: "/account/orders", requiresAuth: true },
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
      <div className="bg-card border-t border-border" style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-around h-14 max-w-[100vw]">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const isCartCenter = item.isCenter;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative ripple touch-target",
                  "active:scale-[0.92] transition-all duration-150"
                )}
              >
                {isCartCenter ? (
                  <div className="relative -mt-5 w-[52px] h-[52px] rounded-full bg-accent flex items-center justify-center border-[3px] border-card elevation-3">
                    <item.icon size={22} className="text-accent-foreground" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <item.icon
                      size={22}
                      strokeWidth={active ? 2.5 : 1.8}
                      className={cn(
                        "transition-colors duration-150",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                )}
                <span className={cn(
                  "text-[10px] font-medium transition-colors duration-150",
                  isCartCenter ? "mt-0.5" : "mt-1",
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

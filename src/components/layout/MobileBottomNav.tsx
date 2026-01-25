import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
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
    { 
      icon: Home, 
      label: "Home", 
      path: "/" 
    },
    { 
      icon: Grid3X3, 
      label: "Categories", 
      path: "/categories" 
    },
    { 
      icon: ShoppingCart, 
      label: "Cart", 
      path: "/checkout",
      badge: cartCount > 0 ? cartCount : undefined
    },
    { 
      icon: User, 
      label: "Account", 
      path: "/account",
      requiresAuth: true
    },
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "active:bg-muted transition-colors"
              )}
            >
              <div className="relative">
                <item.icon
                  size={22}
                  className={cn(
                    "transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

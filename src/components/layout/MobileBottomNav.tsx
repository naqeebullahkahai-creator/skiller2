import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // 4 icons for native app feel: Home, Categories, Cart, Account
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Grid3X3, label: "Categories", path: "/products" },
    { icon: ShoppingCart, label: "Cart", path: "/checkout", badge: cartCount > 0 ? cartCount : undefined },
    { icon: User, label: "Account", path: "/account", requiresAuth: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setAuthModalMode("login");
      setShowAuthModal(true);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-200 touch-target",
                isActive ? "text-primary" : "text-muted-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className={cn(
                    "transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] transition-all",
                isActive ? "font-bold" : "font-medium opacity-80"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

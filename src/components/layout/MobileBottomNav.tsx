import { Home, MessageCircle, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessaging";

const MobileBottomNav = () => {
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();
  const { unreadCount } = useUnreadCount();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Nav items in order: Home, Chats, Cart (center), Account
  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: "/",
      isCenter: false
    },
    { 
      icon: MessageCircle, 
      label: "Chats", 
      path: "/account/messages",
      badge: unreadCount > 0 ? unreadCount : undefined,
      requiresAuth: true,
      isCenter: false
    },
    { 
      icon: ShoppingCart, 
      label: "Cart", 
      path: "/checkout",
      badge: cartCount > 0 ? cartCount : undefined,
      isCenter: true // Cart is the center item with special styling
    },
    { 
      icon: User, 
      label: "Account", 
      path: "/account",
      requiresAuth: true,
      isCenter: false
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
      <div className="flex items-center justify-around h-16">
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
                "active:bg-muted transition-colors",
                isCartCenter && "relative -mt-3"
              )}
            >
              <div className={cn(
                "relative",
                isCartCenter && "w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-fanzon-star to-primary"
              )}>
                <item.icon
                  size={isCartCenter ? 26 : 22}
                  className={cn(
                    "transition-colors",
                    isCartCenter 
                      ? "text-white" 
                      : active 
                        ? "text-primary" 
                        : "text-muted-foreground"
                  )}
                />
                {/* Badge */}
                {item.badge && (
                  <span className={cn(
                    "absolute min-w-[16px] h-4 flex items-center justify-center text-white text-[10px] font-bold rounded-full px-1",
                    isCartCenter 
                      ? "-top-1 -right-1 bg-destructive" 
                      : "-top-1.5 -right-1.5 bg-primary"
                  )}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isCartCenter ? "mt-1 text-primary font-semibold" : "mt-0.5",
                  !isCartCenter && (active ? "text-primary" : "text-muted-foreground")
                )}
              >
                {item.label}
              </span>
              
              {/* Active Indicator - not for cart */}
              {active && !isCartCenter && (
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

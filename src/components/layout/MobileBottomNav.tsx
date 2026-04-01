import { Home, Grid3X3, Heart, Package, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/", requiresAuth: false },
    { icon: Grid3X3, label: "Categories", path: "/categories", requiresAuth: false },
    { icon: Heart, label: "Wishlist", path: "/account/wishlist", requiresAuth: true },
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
      <div className="bg-card border-t border-border" style={{ boxShadow: '0 -1px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-around h-14 max-w-[100vw]">
          {navItems.map((item) => {
            const active = isActive(item.path);
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
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn(
                    "transition-colors duration-150",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors duration-150",
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

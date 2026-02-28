import { Home, Package, ShoppingBag, Wallet, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const SellerBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/seller-app" },
    { icon: Package, label: "Products", path: "/seller-app/products" },
    { icon: ShoppingBag, label: "Orders", path: "/seller-app/orders" },
    { icon: Wallet, label: "Earnings", path: "/seller-app/wallet" },
    { icon: User, label: "Account", path: "/seller-app/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/seller-app") return location.pathname === "/seller-app";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-card border-t border-border" style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full active:scale-[0.92] transition-all duration-150 ripple touch-target"
              >
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}
                />
                <span className={cn("text-[10px] font-medium mt-1", active ? "text-primary font-semibold" : "text-muted-foreground")}>
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

export default SellerBottomNav;

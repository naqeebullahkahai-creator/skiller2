import { Home, Users, ShoppingBag, Settings, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/admin-app" },
    { icon: ShoppingBag, label: "Orders", path: "/admin-app/orders" },
    { icon: Users, label: "Users", path: "/admin-app/users" },
    { icon: BarChart3, label: "Analytics", path: "/admin-app/analytics" },
    { icon: Settings, label: "More", path: "/admin-app/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin-app") return location.pathname === "/admin-app";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-card/98 backdrop-blur-2xl border-t border-border/30 shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full relative active:scale-[0.92] transition-all duration-200"
              >
                <item.icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn("transition-all duration-200", active ? "text-primary" : "text-muted-foreground")}
                />
                <span className={cn("text-[10px] font-medium mt-0.5 transition-all duration-200", active ? "text-primary font-semibold" : "text-muted-foreground")}>
                  {item.label}
                </span>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AdminBottomNav;

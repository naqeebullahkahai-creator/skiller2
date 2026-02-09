import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/contexts/DashboardContext";

const DashboardSidebar = () => {
  const location = useLocation();
  const { role, sidebarOpen, setSidebarOpen } = useDashboard();

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Order Management", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Product Catalog", href: "/dashboard/products", icon: Package },
    { name: "Category Manager", href: "/dashboard/categories", icon: FolderTree },
    { name: "User/Seller Approvals", href: "/dashboard/approvals", icon: UserCheck },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const sellerLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "My Products", href: "/dashboard/products", icon: Package },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : sellerLinks;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-fanzon-dark transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store size={18} className="text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-white">FANZON</span>
          )}
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 hidden md:block"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Role Badge */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold text-center uppercase tracking-wider",
            role === "admin" 
              ? "bg-primary/20 text-primary" 
              : "bg-blue-500/20 text-blue-400"
          )}>
            {role === "admin" ? "Admin Panel" : "Seller Center"}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href || 
              (link.href !== "/dashboard" && location.pathname.startsWith(link.href));
            
            return (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <link.icon size={20} />
                  {sidebarOpen && <span>{link.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => {
            // Will be wired via props if needed
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

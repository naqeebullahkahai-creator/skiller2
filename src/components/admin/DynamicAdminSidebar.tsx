import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, Wallet,
  Zap, UserCircle, Store, DollarSign, Headphones, Shield, Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionFeature } from "@/hooks/useRoleManagement";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
}

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
  onNavigate?: () => void;
}

const DynamicAdminSidebar = ({ sidebarOpen, onNavigate }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Sellers Management", href: "/admin/sellers-management", icon: Store, feature: 'users' },
    { name: "Customers Management", href: "/admin/customers-management", icon: UserCircle, feature: 'users' },
    { name: "Agents Management", href: "/admin/agents-management", icon: Headphones, feature: 'users' },
    { name: "Orders Management", href: "/admin/orders-management", icon: ShoppingCart, feature: 'orders' },
    { name: "Products & Catalog", href: "/admin/products-management", icon: Package, feature: 'products' },
    { name: "Financial Controls", href: "/admin/finance-management", icon: DollarSign, feature: 'payouts' },
    { name: "Marketing", href: "/admin/marketing-management", icon: Megaphone, feature: 'flash_sales' },
    { name: "Content & Settings", href: "/admin/content-management", icon: Settings, feature: 'settings' },
    { name: "Security & Access", href: "/admin/security-management", icon: Shield, requireSuperAdmin: true },
  ];

  const visibleItems = navItems.filter(item => {
    if (isSuperAdmin) return true;
    if (item.requireSuperAdmin) return false;
    if (!item.feature) return true;
    return canView(item.feature);
  });

  if (isLoading) {
    return (
      <nav className="flex-1 p-4 space-y-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-[hsl(var(--dashboard-sidebar-hover))] rounded-lg animate-pulse" />
        ))}
      </nav>
    );
  }

  const isLinkActive = (href: string) =>
    location.pathname === href ||
    (href !== "/admin/dashboard" && location.pathname.startsWith(href));

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
            isLinkActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
          )}
        >
          <item.icon size={sidebarOpen ? 20 : 24} className="shrink-0" />
          {sidebarOpen && <span className="text-sm">{item.name}</span>}
        </Link>
      ))}
    </nav>
  );
};

export default DynamicAdminSidebar;

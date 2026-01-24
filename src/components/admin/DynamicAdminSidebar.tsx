import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
  Users, 
  Settings,
  ShieldCheck,
  Wallet,
  Zap,
  BarChart3,
  Ticket,
  Image,
  Star,
  XCircle,
  RotateCcw,
  MessageSquare,
  UserCircle,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionFeature } from "@/hooks/useRoleManagement";

interface NavLink {
  name: string;
  href: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
}

const allAdminLinks: NavLink[] = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "User Directory", href: "/admin-dashboard/users", icon: UserCircle, feature: 'users' },
  { name: "Roles & Permissions", href: "/admin-dashboard/roles", icon: Shield, requireSuperAdmin: true },
  { name: "Order Management", href: "/admin-dashboard/orders", icon: ShoppingCart, feature: 'orders' },
  { name: "Cancellations", href: "/admin-dashboard/cancellations", icon: XCircle, feature: 'orders' },
  { name: "Returns", href: "/admin-dashboard/returns", icon: RotateCcw, feature: 'returns' },
  { name: "Product Catalog", href: "/admin-dashboard/products", icon: Package, feature: 'products' },
  { name: "Category Manager", href: "/admin-dashboard/categories", icon: FolderOpen, feature: 'categories' },
  { name: "Reviews", href: "/admin-dashboard/reviews", icon: Star, feature: 'reviews' },
  { name: "Q&A Moderation", href: "/admin-dashboard/qa-moderation", icon: MessageSquare, feature: 'reviews' },
  { name: "Flash Sales", href: "/admin-dashboard/flash-sales", icon: Zap, feature: 'flash_sales' },
  { name: "Vouchers", href: "/admin-dashboard/vouchers", icon: Ticket, feature: 'vouchers' },
  { name: "Banners", href: "/admin-dashboard/banners", icon: Image, feature: 'banners' },
  { name: "Bulk Uploads", href: "/admin-dashboard/bulk-uploads", icon: Package, feature: 'products' },
  { name: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart3, feature: 'analytics' },
  { name: "Seller Approvals", href: "/admin-dashboard/approvals", icon: Users, feature: 'users' },
  { name: "Seller KYC", href: "/admin-dashboard/kyc", icon: ShieldCheck, feature: 'users' },
  { name: "Payouts", href: "/admin-dashboard/payouts", icon: Wallet, feature: 'payouts' },
  { name: "Settings", href: "/admin-dashboard/settings", icon: Settings, feature: 'settings' },
];

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
}

const DynamicAdminSidebar = ({ sidebarOpen }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();
  
  // Filter links based on permissions
  const visibleLinks = allAdminLinks.filter(link => {
    // Super admin sees everything
    if (isSuperAdmin) return true;
    
    // If requires super admin and user is not, hide it
    if (link.requireSuperAdmin && !isSuperAdmin) return false;
    
    // Dashboard is always visible
    if (!link.feature) return true;
    
    // Check if user has view permission for the feature
    return canView(link.feature);
  });
  
  if (isLoading) {
    return (
      <nav className="flex-1 p-4 space-y-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </nav>
    );
  }
  
  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {visibleLinks.map((link) => {
        const isActive = location.pathname === link.href || 
          (link.href !== "/admin-dashboard" && location.pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <link.icon size={20} />
            {sidebarOpen && <span>{link.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
};

export default DynamicAdminSidebar;

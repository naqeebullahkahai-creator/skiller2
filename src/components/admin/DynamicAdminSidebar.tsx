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
  Shield,
  Globe,
  PiggyBank,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionFeature } from "@/hooks/useRoleManagement";
import { useAdminDepositRequests } from "@/hooks/useDeposits";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface NavLink {
  name: string;
  href: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
}

interface NavDropdown {
  name: string;
  icon: any;
  feature?: PermissionFeature;
  children: { name: string; href: string; badge?: number }[];
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
  { name: "Seller KYC", href: "/admin-dashboard/seller-kyc", icon: ShieldCheck, feature: 'users' },
  { name: "Payouts", href: "/admin-dashboard/payouts", icon: Wallet, feature: 'payouts' },
  { name: "Site Settings", href: "/admin-dashboard/site-settings", icon: Globe, feature: 'settings' },
  { name: "Settings", href: "/admin-dashboard/settings", icon: Settings, feature: 'settings' },
];

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
}

const DynamicAdminSidebar = ({ sidebarOpen }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();
  const [depositsOpen, setDepositsOpen] = useState(
    location.pathname.includes('/deposits')
  );
  
  // Get pending deposit counts
  const { pendingCount: pendingSellerDeposits } = useAdminDepositRequests('seller');
  const { pendingCount: pendingCustomerDeposits } = useAdminDepositRequests('customer');
  const totalPendingDeposits = pendingSellerDeposits + pendingCustomerDeposits;
  
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

  // Check if deposits should be shown (payouts permission)
  const showDeposits = isSuperAdmin || canView('payouts');
  
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
        
        // Insert Deposits dropdown after Payouts
        if (link.name === "Payouts" && showDeposits) {
          return (
            <div key={link.name}>
              <Link
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
              
              {/* Deposit Requests Dropdown */}
              <Collapsible open={depositsOpen} onOpenChange={setDepositsOpen}>
                <CollapsibleTrigger className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors w-full mt-1",
                  location.pathname.includes('/deposits')
                    ? "bg-primary/20 text-primary"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}>
                  <div className="flex items-center gap-3">
                    <PiggyBank size={20} />
                    {sidebarOpen && <span>Deposit Requests</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="flex items-center gap-2">
                      {totalPendingDeposits > 0 && (
                        <span className="text-xs bg-destructive text-white px-1.5 py-0.5 rounded-full">
                          {totalPendingDeposits}
                        </span>
                      )}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        depositsOpen && "rotate-180"
                      )} />
                    </div>
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-8 mt-1 space-y-1">
                    <Link
                      to="/admin/deposits/sellers"
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        location.pathname === "/admin/deposits/sellers"
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <span>Seller Deposits</span>
                      {pendingSellerDeposits > 0 && (
                        <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                          {pendingSellerDeposits}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/deposits/users"
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        location.pathname === "/admin/deposits/users"
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <span>User Deposits</span>
                      {pendingCustomerDeposits > 0 && (
                        <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                          {pendingCustomerDeposits}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/admin/deposits/settings"
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
                        location.pathname === "/admin/deposits/settings"
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      Deposit Settings
                    </Link>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        }
        
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

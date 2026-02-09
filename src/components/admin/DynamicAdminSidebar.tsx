import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
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
  Users,
  CreditCard,
  Store,
  ClipboardList,
  DollarSign,
  FileCheck,
  UserCheck,
  Scale,
  FileText,
  Headphones,
  Percent,
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

interface NavItem {
  name: string;
  href: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
  badge?: number;
}

interface NavGroup {
  name: string;
  icon: any;
  feature?: PermissionFeature;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
  onNavigate?: () => void;
}

const DynamicAdminSidebar = ({ sidebarOpen, onNavigate }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();
  
  const { pendingCount: pendingSellerDeposits } = useAdminDepositRequests('seller');
  const { pendingCount: pendingCustomerDeposits } = useAdminDepositRequests('customer');
  const totalPendingDeposits = pendingSellerDeposits + pendingCustomerDeposits;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const path = location.pathname;
    return {
      'Deposit Management': path.includes('/deposits') || path.includes('/payment-methods'),
      'User Management': path.includes('/users') || path.includes('/sellers'),
      'Verification Hub': path.includes('/seller-kyc') || path.includes('/approvals'),
      'Order Management': path.includes('/orders') || path.includes('/cancellations'),
      'Financial Controls': path.includes('/payouts') || path.includes('/balance-adjustments') || path.includes('/analytics'),
    };
  });

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const navEntries: NavEntry[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "User Management",
      icon: Users,
      feature: 'users',
      children: [
        { name: "Customer List", href: "/admin/users", icon: UserCircle, feature: 'users' },
        { name: "Seller List", href: "/admin/sellers", icon: Store, feature: 'users' },
      ],
    },
    {
      name: "Verification Hub",
      icon: ShieldCheck,
      feature: 'users',
      children: [
        { name: "Pending KYC", href: "/admin/seller-kyc", icon: FileCheck },
        { name: "Seller Approvals", href: "/admin/approvals", icon: UserCheck },
      ],
    },
    { name: "Roles & Permissions", href: "/admin/roles", icon: Shield, requireSuperAdmin: true },
    {
      name: "Order Management",
      icon: ShoppingCart,
      feature: 'orders',
      children: [
        { name: "All Orders", href: "/admin/orders", icon: ClipboardList, feature: 'orders' },
        { name: "Direct Store Orders", href: "/admin/orders/direct", icon: Store, feature: 'orders' },
        { name: "Vendor Orders", href: "/admin/orders/vendor", icon: Users, feature: 'orders' },
        { name: "Cancellations", href: "/admin/cancellations", icon: XCircle, feature: 'orders' },
      ],
    },
    { name: "Returns", href: "/admin/returns", icon: RotateCcw, feature: 'returns' },
    { name: "Product Catalog", href: "/admin/products", icon: Package, feature: 'products' },
    { name: "Category Manager", href: "/admin/categories", icon: FolderOpen, feature: 'categories' },
    {
      name: "Deposit Management",
      icon: PiggyBank,
      feature: 'payouts',
      children: [
        { name: "User Deposits", href: "/admin/deposits/users", icon: UserCircle, badge: pendingCustomerDeposits },
        { name: "Seller Deposits", href: "/admin/deposits/sellers", icon: Store, badge: pendingSellerDeposits },
        { name: "Payment Methods", href: "/admin/payment-methods", icon: CreditCard },
      ],
    },
    {
      name: "Financial Controls",
      icon: DollarSign,
      feature: 'payouts',
      children: [
        { name: "Commission Management", href: "/admin/commission-management", icon: Percent },
        { name: "Payouts", href: "/admin/payouts", icon: Wallet },
        { name: "Balance Adjustments", href: "/admin/balance-adjustments", icon: Scale },
        { name: "Platform Revenue", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    { name: "Reviews", href: "/admin/reviews", icon: Star, feature: 'reviews' },
    { name: "Q&A Moderation", href: "/admin/qa", icon: MessageSquare, feature: 'reviews' },
    { name: "Flash Sales", href: "/admin/flash-sales", icon: Zap, feature: 'flash_sales' },
    { name: "Vouchers", href: "/admin/vouchers", icon: Ticket, feature: 'vouchers' },
    { name: "Banners", href: "/admin/banners", icon: Image, feature: 'banners' },
    { name: "Bulk Uploads", href: "/admin/bulk-uploads", icon: Package, feature: 'products' },
    { name: "Chat Shortcuts", href: "/admin/chat-shortcuts", icon: Headphones, feature: 'settings' },
    { name: "Content Manager", href: "/admin/content-manager", icon: FileText, feature: 'settings' },
    { name: "Site Settings", href: "/admin/site-settings", icon: Globe, feature: 'settings' },
    { name: "Brand Assets", href: "/admin/brand-assets", icon: Image, feature: 'settings' },
    { name: "Send Notification", href: "/admin/notifications", icon: UserCircle, feature: 'settings' },
    { name: "Settings", href: "/admin/settings", icon: Settings, feature: 'settings' },
  ];

  const isVisible = (entry: NavEntry): boolean => {
    if (isSuperAdmin) return true;
    if ('requireSuperAdmin' in entry && entry.requireSuperAdmin) return false;
    if (!entry.feature) return true;
    return canView(entry.feature);
  };

  const visibleEntries = navEntries.filter(entry => {
    if (!isVisible(entry)) return false;
    if (isGroup(entry)) {
      entry.children = entry.children.filter(child => isVisible(child));
      return entry.children.length > 0;
    }
    return true;
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

  const isLinkActive = (href: string) =>
    location.pathname === href ||
    (href !== "/admin/dashboard" && location.pathname.startsWith(href));

  const getGroupBadge = (group: NavGroup) => {
    if (group.name === "Deposit Management") return totalPendingDeposits;
    return 0;
  };

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {visibleEntries.map((entry) => {
        if (isGroup(entry)) {
          const groupBadge = getGroupBadge(entry);
          const hasActiveChild = entry.children.some(c => isLinkActive(c.href));

          return (
            <Collapsible
              key={entry.name}
              open={openGroups[entry.name] || hasActiveChild}
              onOpenChange={() => toggleGroup(entry.name)}
            >
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors w-full",
                hasActiveChild
                  ? "bg-primary/20 text-primary"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}>
                <div className="flex items-center gap-3">
                  <entry.icon size={20} />
                  {sidebarOpen && <span className="text-sm">{entry.name}</span>}
                </div>
                {sidebarOpen && (
                  <div className="flex items-center gap-2">
                    {groupBadge > 0 && (
                      <span className="text-xs bg-destructive text-white px-1.5 py-0.5 rounded-full">
                        {groupBadge}
                      </span>
                    )}
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      (openGroups[entry.name] || hasActiveChild) && "rotate-180"
                    )} />
                  </div>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-4">
                  {entry.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        isLinkActive(child.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <child.icon size={16} />
                        <span>{child.name}</span>
                      </div>
                      {(child.badge ?? 0) > 0 && (
                        <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
                          {child.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        }

        const item = entry as NavItem;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              isLinkActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="text-sm">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
};

export default DynamicAdminSidebar;

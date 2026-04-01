import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, Wallet,
  UserCircle, Store, Headphones, Shield,
  Megaphone, Zap, BarChart3, Star, Tag, Image, Bell, Wrench, 
  Lock, KeyRound, FileText, MessageSquare, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionFeature } from "@/hooks/useRoleManagement";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";
import { ChevronDown } from "lucide-react";

interface NavChild {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

interface NavGroup {
  name: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
  href?: string;
  children?: NavChild[];
  badge?: number;
}

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
  onNavigate?: () => void;
}

const CountBadge = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const DynamicAdminSidebar = ({ sidebarOpen, onNavigate }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();
  const counts = useAdminSidebarCounts();

  const navGroups: NavGroup[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    // Management Modules - main entry points
    {
      name: "Seller Module", href: "/admin/module/sellers", icon: Store,
      badge: counts.pendingKyc,
    },
    {
      name: "Customer Module", href: "/admin/module/customers", icon: UserCircle,
    },
    {
      name: "Agent Module", href: "/admin/module/agents", icon: Headphones,
      badge: counts.pendingPayouts,
    },
    // Core operational sections
    {
      name: "Orders", icon: ShoppingCart, feature: 'orders',
      badge: counts.pendingOrders + counts.pendingReturns,
      children: [
        { name: "All Orders", href: "/admin/orders-management", icon: ShoppingCart, badge: counts.pendingOrders },
        { name: "Direct Orders", href: "/admin/store/orders", icon: Store },
        { name: "Vendor Orders", href: "/admin/orders/vendor", icon: Package },
        { name: "Cancellations", href: "/admin/cancellations", icon: ShoppingCart },
        { name: "Returns", href: "/admin/returns", icon: ShoppingCart, badge: counts.pendingReturns },
      ]
    },
    {
      name: "Products", icon: Package, feature: 'products',
      badge: counts.pendingApprovals,
      children: [
        { name: "All Products", href: "/admin/products-management", icon: Package },
        { name: "Categories", href: "/admin/categories", icon: Tag },
        { name: "Approvals", href: "/admin/approvals", icon: FileText, badge: counts.pendingApprovals },
      ]
    },
    {
      name: "Finance", icon: Wallet, feature: 'payouts',
      children: [
        { name: "Admin Wallet", href: "/admin/wallet", icon: Wallet },
        { name: "Commission Wallet", href: "/admin/commission-wallet", icon: Wallet },
        { name: "Subscription Wallet", href: "/admin/subscription-wallet", icon: Wallet },
        { name: "Store Wallet", href: "/admin/store/wallet", icon: Store },
      ]
    },
    {
      name: "Flash Sales", icon: Zap, feature: 'flash_sales',
      badge: counts.pendingNominations,
      children: [
        { name: "Manage Sales", href: "/admin/flash-sales", icon: Zap },
        { name: "Nominations", href: "/admin/flash-nominations", icon: Star, badge: counts.pendingNominations },
      ]
    },
    {
      name: "Marketing", icon: Megaphone, feature: 'flash_sales',
      children: [
        { name: "Vouchers", href: "/admin/vouchers", icon: Tag },
        { name: "Banners", href: "/admin/banners", icon: Image },
      ]
    },
    {
      name: "Content", icon: Settings, feature: 'settings',
      children: [
        { name: "Reviews", href: "/admin/reviews", icon: Star },
        { name: "Q&A Moderation", href: "/admin/qa", icon: FileText },
        { name: "Site Content", href: "/admin/content-manager", icon: FileText },
        { name: "Brand Assets", href: "/admin/brand-assets", icon: Image },
        { name: "Notifications", href: "/admin/notifications", icon: Bell },
        { name: "Chat Shortcuts", href: "/admin/chat-shortcuts", icon: MessageSquare },
        { name: "All Settings", href: "/admin/all-settings", icon: Wrench },
        { name: "Platform Blueprint", href: "/admin/platform-blueprint", icon: FileText },
        { name: "APK Builder", href: "/admin/apk-build", icon: Smartphone },
      ]
    },
    {
      name: "Admin Store", icon: Store,
      children: [
        { name: "Store Home", href: "/admin/store", icon: Store },
        { name: "Products", href: "/admin/store/products", icon: Package },
      ]
    },
    {
      name: "Security", icon: Shield, requireSuperAdmin: true,
      children: [
        { name: "Roles & Permissions", href: "/admin/roles", icon: KeyRound },
        { name: "Security Settings", href: "/admin/security", icon: Lock },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ]
    },
  ];

  const visibleGroups = navGroups.filter(item => {
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

  const normalizeAdminPath = (path: string) => path.replace(/^\/admin-app/, "/admin");

  const isLinkActive = (href: string) => {
    const currentPath = normalizeAdminPath(location.pathname);
    const targetPath = normalizeAdminPath(href);
    if (currentPath === targetPath) return true;
    if (targetPath === "/admin/dashboard") return false;
    return currentPath.startsWith(targetPath + "/");
  };

  const isGroupActive = (group: NavGroup) => {
    if (group.href) return isLinkActive(group.href);
    return group.children?.some(c => isLinkActive(c.href)) || false;
  };

  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {visibleGroups.map((group) => {
        if (!group.children || group.children.length === 0) {
          return (
            <Link
              key={group.href}
              to={group.href!}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                isLinkActive(group.href!)
                  ? "bg-primary text-primary-foreground"
                  : "text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
              )}
            >
              <group.icon size={sidebarOpen ? 18 : 24} className="shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="text-sm flex-1">{group.name}</span>
                  {group.badge ? <CountBadge count={group.badge} /> : null}
                </>
              )}
              {!sidebarOpen && group.badge ? (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />
              ) : null}
            </Link>
          );
        }

        const active = isGroupActive(group);

        return (
          <Collapsible key={group.name} defaultOpen={active}>
            <CollapsibleTrigger className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left",
              active
                ? "bg-primary/10 text-primary"
                : "text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
            )}>
              <group.icon size={sidebarOpen ? 18 : 24} className="shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="text-sm flex-1">{group.name}</span>
                  {group.badge ? <CountBadge count={group.badge} /> : null}
                  <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </>
              )}
            </CollapsibleTrigger>
            {sidebarOpen && (
              <CollapsibleContent className="pl-4 mt-0.5 space-y-0.5">
                {group.children.map((child) => (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm",
                      isLinkActive(child.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-[hsl(var(--dashboard-sidebar-text))]/80 hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
                    )}
                  >
                    <child.icon size={15} className="shrink-0" />
                    <span className="flex-1">{child.name}</span>
                    {child.badge ? <CountBadge count={child.badge} /> : null}
                  </Link>
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </nav>
  );
};

export default DynamicAdminSidebar;

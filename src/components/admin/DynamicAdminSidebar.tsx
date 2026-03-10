import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingCart, Settings, Wallet,
  UserCircle, Store, DollarSign, Headphones, Shield, Megaphone,
  ChevronDown, ChevronRight, Users, Receipt, CreditCard, Scale,
  PiggyBank, Percent, Zap, BarChart3, FileText, Star, Tag,
  Image, Bell, Wrench, Lock, KeyRound, Activity, Clock, Search, Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionFeature } from "@/hooks/useRoleManagement";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavChild {
  name: string;
  href: string;
  icon: any;
}

interface NavGroup {
  name: string;
  icon: any;
  feature?: PermissionFeature;
  requireSuperAdmin?: boolean;
  href?: string; // direct link (no children)
  children?: NavChild[];
}

interface DynamicAdminSidebarProps {
  sidebarOpen: boolean;
  onNavigate?: () => void;
}

const DynamicAdminSidebar = ({ sidebarOpen, onNavigate }: DynamicAdminSidebarProps) => {
  const location = useLocation();
  const { canView, isLoading } = usePermissions();
  const { isSuperAdmin } = useAuth();

  const navGroups: NavGroup[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Sellers", icon: Store, feature: 'users',
      children: [
        { name: "All Sellers", href: "/admin/sellers-management", icon: Store },
        { name: "Seller KYC", href: "/admin/seller-kyc", icon: FileText },
        { name: "Seller Directory", href: "/admin/sellers", icon: Users },
      ]
    },
    {
      name: "Customers", icon: UserCircle, feature: 'users',
      children: [
        { name: "All Customers", href: "/admin/customers-management", icon: UserCircle },
        { name: "User Directory", href: "/admin/users", icon: Users },
      ]
    },
    { name: "Agents", href: "/admin/agents-management", icon: Headphones, feature: 'users' },
    {
      name: "Orders", icon: ShoppingCart, feature: 'orders',
      children: [
        { name: "All Orders", href: "/admin/orders-management", icon: ShoppingCart },
        { name: "Direct Orders", href: "/admin/orders/direct", icon: Store },
        { name: "Vendor Orders", href: "/admin/orders/vendor", icon: Package },
        { name: "Cancellations", href: "/admin/cancellations", icon: ShoppingCart },
        { name: "Returns", href: "/admin/returns", icon: ShoppingCart },
        { name: "Track Orders", href: "/admin/tracking-search", icon: Search },
      ]
    },
    {
      name: "Products", icon: Package, feature: 'products',
      children: [
        { name: "All Products", href: "/admin/products-management", icon: Package },
        { name: "Categories", href: "/admin/categories", icon: Tag },
        { name: "Approvals", href: "/admin/approvals", icon: FileText },
        { name: "Bulk Uploads", href: "/admin/bulk-uploads", icon: Package },
      ]
    },
    {
      name: "Wallets", icon: Wallet, feature: 'payouts',
      children: [
        { name: "Wallet Hub", href: "/admin/wallet-management", icon: Wallet },
        { name: "Admin Wallet", href: "/admin/wallet", icon: Wallet },
        { name: "Commission Wallet", href: "/admin/commission-wallet", icon: Percent },
        { name: "Subscription Wallet", href: "/admin/subscription-wallet", icon: Receipt },
        { name: "Store Wallet", href: "/admin/store/wallet", icon: Store },
      ]
    },
    {
      name: "Deposits", icon: PiggyBank, feature: 'payouts',
      children: [
        { name: "Seller Deposits", href: "/admin/deposits/sellers", icon: PiggyBank },
        { name: "Customer Deposits", href: "/admin/deposits/users", icon: PiggyBank },
        { name: "Deposit Settings", href: "/admin/deposits/settings", icon: Settings },
      ]
    },
    {
      name: "Withdrawals", icon: DollarSign, feature: 'payouts',
      children: [
        { name: "Payout Requests", href: "/admin/payouts", icon: DollarSign },
        { name: "Withdrawal Methods", href: "/admin/withdrawal-methods", icon: CreditCard },
        { name: "Balance Adjustments", href: "/admin/balance-adjustments", icon: Scale },
      ]
    },
    {
      name: "Commission & Fees", icon: Percent, feature: 'payouts',
      children: [
        { name: "Commission Settings", href: "/admin/commission-management", icon: Percent },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: Receipt },
        { name: "Payment Methods", href: "/admin/payment-methods", icon: CreditCard },
        { name: "Payment Settings", href: "/admin/payment-settings", icon: Settings },
      ]
    },
    {
      name: "Flash Sales", icon: Zap, feature: 'flash_sales',
      children: [
        { name: "Manage Sales", href: "/admin/flash-sales", icon: Zap },
        { name: "Nominations", href: "/admin/flash-nominations", icon: Star },
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
        { name: "Chat Shortcuts", href: "/admin/chat-shortcuts", icon: FileText },
        { name: "All Settings", href: "/admin/all-settings", icon: Wrench },
      ]
    },
    {
      name: "Admin Store", icon: Store,
      children: [
        { name: "Store Home", href: "/admin/store", icon: Store },
        { name: "Products", href: "/admin/store/products", icon: Package },
        { name: "Orders", href: "/admin/store/orders", icon: ShoppingCart },
        { name: "Wallet", href: "/admin/store/wallet", icon: Wallet },
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

  const isLinkActive = (href: string) =>
    location.pathname === href ||
    (href !== "/admin/dashboard" && location.pathname.startsWith(href));

  const isGroupActive = (group: NavGroup) => {
    if (group.href) return isLinkActive(group.href);
    return group.children?.some(c => isLinkActive(c.href)) || false;
  };

  return (
    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
      {visibleGroups.map((group) => {
        // Direct link (no children)
        if (!group.children || group.children.length === 0) {
          return (
            <Link
              key={group.href}
              to={group.href!}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isLinkActive(group.href!)
                  ? "bg-primary text-primary-foreground"
                  : "text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
              )}
            >
              <group.icon size={sidebarOpen ? 18 : 24} className="shrink-0" />
              {sidebarOpen && <span className="text-sm">{group.name}</span>}
            </Link>
          );
        }

        // Dropdown group
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
                    <span>{child.name}</span>
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

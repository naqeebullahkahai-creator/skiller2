import { UserCircle, Users, ShoppingCart, Wallet, CreditCard, RotateCcw, Bell, Star, MessageSquare } from "lucide-react";
import AdminModuleLayout, { ModuleNavItem } from "./AdminModuleLayout";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";

const CustomerModuleLayout = () => {
  const counts = useAdminSidebarCounts();

  const navItems: ModuleNavItem[] = [
    { name: "Overview", href: "/admin/module/customers", icon: UserCircle },
    { name: "All Customers", href: "/admin/module/customers/directory", icon: Users },
    { name: "Customer Orders", href: "/admin/module/customers/orders", icon: ShoppingCart },
    { name: "Deposits", href: "/admin/module/customers/deposits", icon: CreditCard, badge: counts.pendingCustomerDeposits },
    { name: "Wallets", href: "/admin/module/customers/wallets", icon: Wallet },
    { name: "Returns", href: "/admin/module/customers/returns", icon: RotateCcw, badge: counts.pendingReturns },
    { name: "Reviews", href: "/admin/module/customers/reviews", icon: Star },
    { name: "Notifications", href: "/admin/module/customers/notifications", icon: Bell },
  ];

  return (
    <AdminModuleLayout
      title="Customer Management"
      icon={UserCircle}
      color="bg-blue-600"
      backHref="/admin/dashboard"
      navItems={navItems}
    />
  );
};

export default CustomerModuleLayout;

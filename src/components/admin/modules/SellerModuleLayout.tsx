import { Store, Users, FileText, ShoppingCart, Package, Wallet, Zap, Star, BarChart3, Upload, Tag, RotateCcw, XCircle, DollarSign, CreditCard } from "lucide-react";
import AdminModuleLayout, { ModuleNavItem } from "./AdminModuleLayout";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";

const SellerModuleLayout = () => {
  const counts = useAdminSidebarCounts();

  const navItems: ModuleNavItem[] = [
    { name: "Overview", href: "/admin/module/sellers", icon: Store },
    { name: "All Sellers", href: "/admin/module/sellers/directory", icon: Users },
    { name: "Seller KYC", href: "/admin/module/sellers/kyc", icon: FileText, badge: counts.pendingKyc },
    { name: "Seller Orders", href: "/admin/module/sellers/orders", icon: ShoppingCart },
    { name: "Vendor Orders", href: "/admin/module/sellers/vendor-orders", icon: Package },
    { name: "Product Approvals", href: "/admin/module/sellers/approvals", icon: Package, badge: counts.pendingApprovals },
    { name: "Bulk Uploads", href: "/admin/module/sellers/bulk-uploads", icon: Upload },
    { name: "Flash Nominations", href: "/admin/module/sellers/flash-nominations", icon: Zap, badge: counts.pendingNominations },
    { name: "Seller Deposits", href: "/admin/module/sellers/deposits", icon: CreditCard, badge: counts.pendingSellerDeposits },
    { name: "Payouts", href: "/admin/module/sellers/payouts", icon: DollarSign, badge: counts.pendingPayouts },
    { name: "Commissions", href: "/admin/module/sellers/commissions", icon: DollarSign, badge: counts.pendingCommissions },
    { name: "Subscriptions", href: "/admin/module/sellers/subscriptions", icon: Tag },
    { name: "Reviews", href: "/admin/module/sellers/reviews", icon: Star },
    { name: "Returns", href: "/admin/module/sellers/returns", icon: RotateCcw, badge: counts.pendingReturns },
    { name: "Cancellations", href: "/admin/module/sellers/cancellations", icon: XCircle },
  ];

  return (
    <AdminModuleLayout
      title="Seller Management"
      icon={Store}
      color="bg-emerald-600"
      backHref="/admin/dashboard"
      navItems={navItems}
    />
  );
};

export default SellerModuleLayout;

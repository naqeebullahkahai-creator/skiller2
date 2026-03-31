import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";
import { useAdminSellers } from "@/hooks/useAdminSellers";
import { Store, Users, FileText, ShoppingCart, Package, ChevronRight, TrendingUp } from "lucide-react";

const SellerModuleHome = () => {
  const navigate = useNavigate();
  const counts = useAdminSidebarCounts();

  const stats = [
    { label: "Pending KYC", value: counts.pendingKyc, color: "text-amber-600" },
    { label: "Pending Approvals", value: counts.pendingApprovals, color: "text-primary" },
    { label: "Pending Deposits", value: counts.pendingSellerDeposits, color: "text-emerald-600" },
    { label: "Pending Payouts", value: counts.pendingPayouts, color: "text-violet-600" },
  ];

  const quickLinks = [
    { title: "All Sellers", desc: "View & manage sellers", icon: Users, href: "/admin/module/sellers/directory", color: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Seller KYC", desc: "Review verifications", icon: FileText, href: "/admin/module/sellers/kyc", badge: counts.pendingKyc, color: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Product Approvals", desc: "Approve products", icon: Package, href: "/admin/module/sellers/approvals", badge: counts.pendingApprovals, color: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Vendor Orders", desc: "Marketplace orders", icon: ShoppingCart, href: "/admin/module/sellers/vendor-orders", color: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seller Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage all seller operations from one place</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quickLinks.map((link, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] border-0 shadow-sm" onClick={() => navigate(link.href)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", link.color)}>
                <link.icon size={20} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{link.title}</h3>
                  {link.badge ? <Badge variant="destructive" className="text-xs">{link.badge}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SellerModuleHome;

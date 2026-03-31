import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";
import { UserCircle, Users, ShoppingCart, Wallet, CreditCard, Star, ChevronRight } from "lucide-react";

const CustomerModuleHome = () => {
  const navigate = useNavigate();
  const counts = useAdminSidebarCounts();

  const stats = [
    { label: "Pending Deposits", value: counts.pendingCustomerDeposits, color: "text-blue-600" },
    { label: "Pending Returns", value: counts.pendingReturns, color: "text-amber-600" },
  ];

  const quickLinks = [
    { title: "All Customers", desc: "View & manage customers", icon: Users, href: "/admin/module/customers/directory", color: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Customer Orders", desc: "View all orders", icon: ShoppingCart, href: "/admin/module/customers/orders", color: "bg-primary/10" },
    { title: "Customer Deposits", desc: "Deposit requests", icon: CreditCard, href: "/admin/module/customers/deposits", badge: counts.pendingCustomerDeposits, color: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Reviews", desc: "Customer reviews", icon: Star, href: "/admin/module/customers/reviews", color: "bg-amber-100 dark:bg-amber-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage all customer operations</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

export default CustomerModuleHome;

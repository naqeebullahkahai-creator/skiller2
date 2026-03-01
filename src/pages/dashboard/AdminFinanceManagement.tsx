import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, CreditCard, DollarSign, Percent, PiggyBank, Scale, Settings,
  ChevronRight, TrendingUp, Receipt, BarChart3, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useExecutiveAnalytics } from "@/hooks/useExecutiveAnalytics";
import { useAdminDepositRequests } from "@/hooks/useDeposits";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

interface QuickActionProps {
  icon: React.ReactNode; title: string; description: string; href: string; badge?: number; color: string;
}

const QuickAction = ({ icon, title, description, href, badge, color }: QuickActionProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={() => navigate(href)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {badge && badge > 0 ? <Badge variant="destructive" className="text-xs">{badge}</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};

const AdminFinanceManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { stats, isLoading } = useExecutiveAnalytics();
  const { pendingCount: pendingSellerDeposits } = useAdminDepositRequests("seller");
  const { pendingCount: pendingCustomerDeposits } = useAdminDepositRequests("customer");

  const statCards = [
    { label: "Platform Balance", value: stats ? formatPKR(stats.totalPlatformBalance) : "—", icon: <Wallet className="h-5 w-5 text-white" />, color: "bg-violet-500" },
    { label: "Commission Revenue", value: stats ? formatPKR(stats.commissionRevenue) : "—", icon: <Percent className="h-5 w-5 text-white" />, color: "bg-amber-500" },
    { label: "Direct Earnings", value: stats ? formatPKR(stats.adminDirectEarnings) : "—", icon: <TrendingUp className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { label: "Pending Deposits", value: pendingSellerDeposits + pendingCustomerDeposits, icon: <PiggyBank className="h-5 w-5 text-white" />, color: "bg-rose-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <Wallet className="w-5 h-5 text-white" />, title: "Admin Wallet", description: "Platform earnings & balance", href: "/admin/wallet", color: "bg-violet-500" },
    { icon: <DollarSign className="w-5 h-5 text-white" />, title: "Payouts", description: "Seller withdrawal requests", href: "/admin/payouts", color: "bg-emerald-500" },
    { icon: <Percent className="w-5 h-5 text-white" />, title: "Commission & Fees", description: "Manage platform commission", href: "/admin/commission-management", color: "bg-amber-500" },
    { icon: <Receipt className="w-5 h-5 text-white" />, title: "Subscriptions", description: "Seller plans & billing", href: "/admin/subscriptions", color: "bg-blue-500" },
    { icon: <CreditCard className="w-5 h-5 text-white" />, title: "Payment Methods", description: "Bank accounts & wallets", href: "/admin/payment-methods", color: "bg-cyan-500" },
    { icon: <Settings className="w-5 h-5 text-white" />, title: "Payment Settings", description: "COD, wallet, limits", href: "/admin/payment-settings", color: "bg-slate-500" },
    { icon: <Scale className="w-5 h-5 text-white" />, title: "Balance Adjustments", description: "Credit/debit user wallets", href: "/admin/balance-adjustments", color: "bg-rose-500" },
    { icon: <PiggyBank className="w-5 h-5 text-white" />, title: "Seller Deposits", description: "Approve seller deposits", href: "/admin/deposits/sellers", badge: pendingSellerDeposits, color: "bg-orange-500" },
    { icon: <PiggyBank className="w-5 h-5 text-white" />, title: "Customer Deposits", description: "Approve customer deposits", href: "/admin/deposits/users", badge: pendingCustomerDeposits, color: "bg-indigo-500" },
    { icon: <Settings className="w-5 h-5 text-white" />, title: "Deposit Settings", description: "Configure deposit rules", href: "/admin/deposits/settings", color: "bg-gray-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-purple-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> Financial Controls</h1>
        <p className="text-white/80 text-sm mt-1">Wallet, payouts, commissions, subscriptions & deposits</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl shrink-0", card.color)}>{card.icon}</div>
              <div>
                {isLoading ? <Skeleton className="h-6 w-16" /> : <p className="text-lg font-bold">{card.value}</p>}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="overview">Quick Actions</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Detailed analytics available in Platform Revenue</p>
              <p className="text-sm mt-1">Click "Admin Wallet" for detailed financial breakdown</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFinanceManagement;

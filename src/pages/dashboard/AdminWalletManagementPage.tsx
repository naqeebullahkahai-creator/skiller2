import { useNavigate } from "react-router-dom";
import { 
  Wallet, Percent, CreditCard, Store, ChevronRight, ArrowLeft, DollarSign 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminWallet } from "@/hooks/useAdminWallet";
import { useCommissionWallet } from "@/hooks/useCommissionWallet";
import { useExecutiveAnalytics } from "@/hooks/useExecutiveAnalytics";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminWalletManagementPage = () => {
  const navigate = useNavigate();
  const { wallet: adminWallet, walletLoading } = useAdminWallet();
  const { wallet: commWallet, walletLoading: commLoading } = useCommissionWallet();
  const { stats, isLoading: execLoading } = useExecutiveAnalytics();

  const loading = walletLoading || commLoading || execLoading;

  const wallets = [
    {
      title: "Admin Wallet",
      description: "Platform subscription & commission earnings",
      icon: <Wallet className="w-6 h-6 text-white" />,
      color: "bg-violet-500",
      balance: adminWallet?.total_balance || 0,
      href: "/admin/wallet",
      stats: [
        { label: "Subscription", value: formatPKR(adminWallet?.total_subscription_earnings || 0) },
        { label: "Commission", value: formatPKR(adminWallet?.total_commission_earnings || 0) },
      ]
    },
    {
      title: "Commission Wallet",
      description: "Per-product commission from seller sales",
      icon: <Percent className="w-6 h-6 text-white" />,
      color: "bg-amber-500",
      balance: commWallet?.total_balance || 0,
      href: "/admin/commission-wallet",
      stats: [
        { label: "Total Earned", value: formatPKR(commWallet?.total_earned || 0) },
      ]
    },
    {
      title: "Subscription Wallet",
      description: "Seller subscription fee collections",
      icon: <CreditCard className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
      balance: adminWallet?.total_subscription_earnings || 0,
      href: "/admin/subscription-wallet",
      stats: []
    },
    {
      title: "Admin Store Wallet",
      description: "Your direct product sales earnings",
      icon: <Store className="w-6 h-6 text-white" />,
      color: "bg-emerald-500",
      balance: stats?.adminDirectEarnings || 0,
      href: "/admin/store/wallet",
      stats: []
    },
  ];

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/finance-management")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Finance
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6" /> Wallet Management
        </h1>
        <p className="text-white/80 text-sm mt-1">All platform wallets in one place</p>
      </div>

      {/* Total Balance */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Combined Platform Balance</p>
              {loading ? (
                <Skeleton className="h-8 w-40 mt-1" />
              ) : (
                <p className="text-3xl font-bold">{formatPKR(totalBalance)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <Card
            key={wallet.title}
            className="cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
            onClick={() => navigate(wallet.href)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", wallet.color)}>{wallet.icon}</div>
                  <div>
                    <h3 className="font-semibold">{wallet.title}</h3>
                    <p className="text-xs text-muted-foreground">{wallet.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
              </div>
              
              <div className="border-t pt-3">
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-2xl font-bold">{formatPKR(wallet.balance)}</p>
                )}
                <p className="text-xs text-muted-foreground">Current Balance</p>
              </div>

              {wallet.stats.length > 0 && (
                <div className="flex gap-4 mt-3 pt-3 border-t">
                  {wallet.stats.map((stat) => (
                    <div key={stat.label}>
                      {loading ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-sm font-medium text-green-600">{stat.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminWalletManagementPage;

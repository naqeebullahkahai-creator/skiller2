import { useNavigate } from "react-router-dom";
import { 
  Users, Package, ShoppingCart, Wallet, Zap, Shield, BarChart3,
  Settings, TrendingUp, DollarSign, ChevronRight, AlertTriangle, 
  Store, Percent, CreditCard, Bell, Wrench, Headphones
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { useAdminOrderClassification } from "@/hooks/useAdminOrderClassification";
import { useExecutiveAnalytics } from "@/hooks/useExecutiveAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface CommandCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  href: string;
  color: string;
}

const CommandCard = ({ icon, title, description, badge, badgeVariant = "default", href, color }: CommandCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] border-0 shadow-sm" onClick={() => navigate(href)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {badge && <Badge variant={badgeVariant} className="text-xs shrink-0">{badge}</Badge>}
          </div>
          {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useAdminDashboardAnalytics();
  const { directRevenue, vendorRevenue, isLoading: classLoading } = useAdminOrderClassification();
  const { stats: execStats, financialFlow, isLoading: execLoading } = useExecutiveAnalytics();

  // Executive Metric Cards
  const executiveCards = [
    {
      label: "Total Platform Balance",
      value: execStats ? formatPKR(execStats.totalPlatformBalance) : "—",
      icon: <Wallet className="w-5 h-5 text-white" />,
      color: "bg-violet-500",
      sub: "All user & seller wallets",
    },
    {
      label: "Admin Direct Earnings",
      value: execStats ? formatPKR(execStats.adminDirectEarnings) : "—",
      icon: <Store className="w-5 h-5 text-white" />,
      color: "bg-emerald-500",
      sub: "Your own product sales",
    },
    {
      label: "Commission Revenue",
      value: execStats ? formatPKR(execStats.commissionRevenue) : "—",
      icon: <Percent className="w-5 h-5 text-white" />,
      color: "bg-amber-500",
      sub: "Daily fees + Flash sale fees",
    },
    {
      label: "Pending Actions",
      value: execStats ? execStats.pendingActions.toString() : "—",
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      color: execStats && execStats.pendingActions > 0 ? "bg-red-500" : "bg-muted",
      sub: execStats
        ? `${execStats.pendingDeposits} deposits · ${execStats.pendingKyc} KYC · ${execStats.pendingProducts} products`
        : "Loading...",
    },
  ];

  const quickStats = [
    { label: "Revenue", value: stats ? formatPKR(stats.totalRevenue) : "—", icon: <DollarSign className="w-4 h-4" />, change: stats?.revenueChange, color: "text-emerald-500" },
    { label: "Orders", value: stats?.totalOrders?.toLocaleString() || "—", icon: <ShoppingCart className="w-4 h-4" />, change: stats?.ordersChange, color: "text-blue-500" },
    { label: "Pending", value: stats?.pendingApprovals?.toLocaleString() || "0", icon: <AlertTriangle className="w-4 h-4" />, color: (stats?.pendingApprovals || 0) > 0 ? "text-amber-500" : "text-muted-foreground" },
  ];

  const commandCenterActions: CommandCardProps[] = [
    { icon: <Store className="w-6 h-6 text-white" />, title: "Sellers Management", description: "KYC, products, earnings, subscriptions", href: "/admin/sellers-management", color: "bg-blue-500" },
    { icon: <Users className="w-6 h-6 text-white" />, title: "Customers Management", description: "Orders, wallets, deposits, support", href: "/admin/customers-management", color: "bg-cyan-500" },
    { icon: <Headphones className="w-6 h-6 text-white" />, title: "Agents Management", description: "Support agents, performance, chat", href: "/admin/agents-management", color: "bg-indigo-500" },
    { icon: <ShoppingCart className="w-6 h-6 text-white" />, title: "Orders Management", description: "All orders, cancellations, returns", href: "/admin/orders-management", color: "bg-blue-600" },
    { icon: <Package className="w-6 h-6 text-white" />, title: "Products & Catalog", description: "Products, categories, approvals", href: "/admin/products-management", color: "bg-teal-500" },
    { icon: <DollarSign className="w-6 h-6 text-white" />, title: "Financial Controls", description: "Wallet, payouts, commissions", href: "/admin/finance-management", color: "bg-violet-500" },
    { icon: <Zap className="w-6 h-6 text-white" />, title: "Marketing & Promotions", description: "Flash sales, vouchers, banners", href: "/admin/marketing-management", color: "bg-rose-500" },
    { icon: <Settings className="w-6 h-6 text-white" />, title: "Content & Settings", description: "Reviews, Q&A, site config", href: "/admin/content-management", color: "bg-slate-600" },
    { icon: <Shield className="w-6 h-6 text-white" />, title: "Security & Access", description: "Roles, permissions, audit logs", href: "/admin/security-management", color: "bg-red-600" },
  ];

  return (
    <div className="space-y-6 pb-6 overflow-x-hidden">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold mb-1">Admin Control Center</h1>
        <p className="text-white/80 text-sm">Platform management & oversight</p>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {executiveCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              {execLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", card.color)}>{card.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-lg font-bold text-foreground truncate">{card.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{card.sub}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/payment-methods")}>
          <CreditCard className="h-4 w-4 mr-2" />Payment Methods
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/settings")}>
          <Wrench className="h-4 w-4 mr-2" />Maintenance Toggle
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/notifications")}>
          <Bell className="h-4 w-4 mr-2" />Send Notification
        </Button>
      </div>

      {/* Revenue Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/orders/direct')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500"><Store className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Direct Store Revenue</p>
              {classLoading ? <Skeleton className="h-6 w-24" /> : <p className="text-lg font-bold text-emerald-600">{formatPKR(directRevenue)}</p>}
              <p className="text-xs text-muted-foreground">Your own product sales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/orders/vendor')}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500"><Percent className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor Marketplace Revenue</p>
              {classLoading ? <Skeleton className="h-6 w-24" /> : <p className="text-lg font-bold text-amber-600">{formatPKR(vendorRevenue)}</p>}
              <p className="text-xs text-muted-foreground">Commission from sellers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Flow Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenue vs Withdrawals (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {execLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={financialFlow} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => [formatPKR(value), name === "revenue" ? "Revenue" : "Withdrawals"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="withdrawals" stroke="#ef4444" fill="url(#wdGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {quickStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 mx-auto" />
                  <Skeleton className="h-6 w-20 mx-auto" />
                </div>
              ) : (
                <>
                  <div className={cn("flex items-center justify-center gap-1 mb-1", stat.color)}>
                    {stat.icon}
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                  {stat.change !== undefined && (
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className={cn("w-3 h-3", stat.change >= 0 ? "text-emerald-500" : "text-red-500")} />
                      <span className={cn("text-xs", stat.change >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {stat.change >= 0 ? "+" : ""}{stat.change}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Hubs */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground px-1">Management Hubs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commandCenterActions.map((action, index) => <CommandCard key={index} {...action} />)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;

import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Image, 
  Zap, 
  Shield, 
  BarChart3,
  Settings,
  Tags,
  MessageSquare,
  RotateCcw,
  Star,
  FileCheck,
  TrendingUp,
  DollarSign,
  UserCheck,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

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

const CommandCard = ({ 
  icon, 
  title, 
  description, 
  badge, 
  badgeVariant = "default",
  href, 
  color 
}: CommandCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] border-0 shadow-sm"
      onClick={() => navigate(href)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{title}</h3>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs shrink-0">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useAdminDashboardAnalytics();

  const quickStats = [
    {
      label: "Revenue",
      value: stats ? formatPKR(stats.totalRevenue) : "—",
      icon: <DollarSign className="w-4 h-4" />,
      change: stats?.revenueChange,
      color: "text-emerald-500"
    },
    {
      label: "Orders",
      value: stats?.totalOrders?.toLocaleString() || "—",
      icon: <ShoppingCart className="w-4 h-4" />,
      change: stats?.ordersChange,
      color: "text-blue-500"
    },
    {
      label: "Pending",
      value: stats?.pendingApprovals?.toLocaleString() || "0",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: (stats?.pendingApprovals || 0) > 0 ? "text-amber-500" : "text-muted-foreground"
    }
  ];

  const commandCenterActions: CommandCardProps[] = [
    {
      icon: <UserCheck className="w-6 h-6 text-white" />,
      title: "Approve Sellers",
      badge: (stats?.pendingApprovals || 0) > 0 ? `${stats?.pendingApprovals} pending` : undefined,
      badgeVariant: "destructive",
      description: "KYC & Seller Applications",
      href: "/admin-dashboard/seller-kyc",
      color: "bg-primary"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: "Platform Stats",
      description: "Analytics & Insights",
      href: "/admin-dashboard/analytics",
      color: "bg-violet-500"
    },
    {
      icon: <Image className="w-6 h-6 text-white" />,
      title: "Edit Banners",
      description: "Homepage Carousel",
      href: "/admin-dashboard/banners",
      color: "bg-pink-500"
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "Role Management",
      description: "Staff & Permissions",
      href: "/admin-dashboard/roles",
      color: "bg-slate-700"
    }
  ];

  const managementActions: CommandCardProps[] = [
    {
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      title: "Order Management",
      description: "View & update orders",
      href: "/admin-dashboard/orders",
      color: "bg-blue-500"
    },
    {
      icon: <Package className="w-6 h-6 text-white" />,
      title: "Product Catalog",
      description: "Approve & manage products",
      href: "/admin-dashboard/products",
      color: "bg-emerald-500"
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "User Directory",
      description: "Customers & Sellers",
      href: "/admin-dashboard/users",
      color: "bg-cyan-500"
    },
    {
      icon: <Wallet className="w-6 h-6 text-white" />,
      title: "Payout Management",
      description: "Seller withdrawals",
      href: "/admin-dashboard/payouts",
      color: "bg-amber-500"
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Flash Sales",
      description: "Campaigns & Nominations",
      href: "/admin-dashboard/flash-sales",
      color: "bg-rose-500"
    },
    {
      icon: <Tags className="w-6 h-6 text-white" />,
      title: "Categories",
      description: "Manage categories",
      href: "/admin-dashboard/categories",
      color: "bg-indigo-500"
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-white" />,
      title: "Returns",
      description: "Handle returns",
      href: "/admin-dashboard/returns",
      color: "bg-orange-500"
    },
    {
      icon: <Star className="w-6 h-6 text-white" />,
      title: "Reviews",
      description: "Moderate reviews",
      href: "/admin-dashboard/reviews",
      color: "bg-yellow-500"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "Q&A Moderation",
      description: "Product questions",
      href: "/admin-dashboard/qa",
      color: "bg-teal-500"
    },
    {
      icon: <FileCheck className="w-6 h-6 text-white" />,
      title: "Cancellations",
      description: "Order cancellations",
      href: "/admin-dashboard/cancellations",
      color: "bg-red-500"
    },
    {
      icon: <Tags className="w-6 h-6 text-white" />,
      title: "Vouchers",
      description: "Discount codes",
      href: "/admin-dashboard/vouchers",
      color: "bg-purple-500"
    },
    {
      icon: <Settings className="w-6 h-6 text-white" />,
      title: "Settings",
      description: "Platform configuration",
      href: "/admin-dashboard/settings",
      color: "bg-slate-500"
    }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold mb-1">Admin Control Center</h1>
        <p className="text-white/80 text-sm">Platform management & oversight</p>
      </div>

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

      {/* Command Center - Priority Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground px-1">Command Center</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {commandCenterActions.map((action, index) => (
            <CommandCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Full Management Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground px-1">Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {managementActions.map((action, index) => (
            <CommandCard key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;

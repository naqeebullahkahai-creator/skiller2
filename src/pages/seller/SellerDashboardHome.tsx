import { useNavigate } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Wallet, 
  Zap, 
  FileCheck, 
  MessageSquare,
  BarChart3,
  Tags,
  Upload,
  RotateCcw,
  Star,
  Plus,
  TrendingUp,
  Clock,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSellerAnalytics, formatPKR } from "@/hooks/useSellerAnalytics";
import { useSellerWallet } from "@/hooks/useSellerWallet";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentPendingAlert from "@/components/seller/PaymentPendingAlert";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  href: string;
  color: string;
}

const QuickActionCard = ({ 
  icon, 
  title, 
  description, 
  badge, 
  badgeVariant = "default",
  href, 
  color 
}: QuickActionCardProps) => {
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

const SellerDashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalStats, isLoading: analyticsLoading } = useSellerAnalytics();
  const { wallet, isLoading: walletLoading } = useSellerWallet();
  const { orders, isLoading: ordersLoading } = useOrders({ role: "seller", sellerId: user?.id });
  
  const pendingOrders = orders?.filter(o => o.order_status === "pending" || o.order_status === "processing").length || 0;
  const todaySales = orders?.filter(o => {
    const orderDate = new Date(o.created_at);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).reduce((sum, o) => sum + o.total_amount_pkr, 0) || 0;
  
  const isLoading = analyticsLoading || walletLoading || ordersLoading;

  const quickStats = [
    {
      label: "Today's Sales",
      value: formatPKR(todaySales),
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-emerald-500"
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: <Clock className="w-4 h-4" />,
      color: pendingOrders > 0 ? "text-amber-500" : "text-muted-foreground"
    },
    {
      label: "Wallet Balance",
      value: formatPKR(wallet?.current_balance || 0),
      icon: <Wallet className="w-4 h-4" />,
      color: "text-primary"
    }
  ];

  const quickActions: QuickActionCardProps[] = [
    {
      icon: <Package className="w-6 h-6 text-white" />,
      title: "My Products",
      description: `${totalStats.totalOrders} active listings`,
      href: "/seller/products",
      color: "bg-blue-500"
    },
    {
      icon: <Plus className="w-6 h-6 text-white" />,
      title: "Add New Product",
      description: "List a new item",
      href: "/seller/products/new",
      color: "bg-emerald-500"
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      title: "Manage Orders",
      badge: pendingOrders > 0 ? `${pendingOrders} pending` : undefined,
      badgeVariant: "destructive",
      href: "/seller/orders",
      color: "bg-purple-500"
    },
    {
      icon: <Wallet className="w-6 h-6 text-white" />,
      title: "Wallet & Earnings",
      description: formatPKR(wallet?.current_balance || 0),
      href: "/seller/wallet",
      color: "bg-primary"
    },
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      title: "Flash Sale",
      description: "Join promotions",
      href: "/seller/flash-sale",
      color: "bg-amber-500"
    },
    {
      icon: <FileCheck className="w-6 h-6 text-white" />,
      title: "KYC Verification",
      description: "Update documents",
      href: "/seller/kyc",
      color: "bg-teal-500"
    },
    {
      icon: <Tags className="w-6 h-6 text-white" />,
      title: "My Vouchers",
      description: "Create discounts",
      href: "/seller/vouchers",
      color: "bg-pink-500"
    },
    {
      icon: <Upload className="w-6 h-6 text-white" />,
      title: "Bulk Upload",
      description: "Import products",
      href: "/seller/bulk-upload",
      color: "bg-indigo-500"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      title: "Customer Messages",
      description: "Chat with buyers",
      href: "/seller/messages",
      color: "bg-cyan-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: "Analytics",
      description: "Sales insights",
      href: "/seller/analytics",
      color: "bg-violet-500"
    },
    {
      icon: <Star className="w-6 h-6 text-white" />,
      title: "Reviews",
      description: "Customer feedback",
      href: "/seller/reviews",
      color: "bg-yellow-500"
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-white" />,
      title: "Returns",
      description: "Handle returns",
      href: "/seller/returns",
      color: "bg-rose-500"
    }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Payment Pending Alert */}
      <PaymentPendingAlert />

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold mb-1">Welcome to Seller Center</h1>
        <p className="text-white/80 text-sm">Manage your store and grow your business</p>
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
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardHome;

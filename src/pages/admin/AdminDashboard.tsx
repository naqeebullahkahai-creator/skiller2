import { useNavigate } from "react-router-dom";
import { 
  Users, ShoppingBag, Package, BarChart3, 
  Settings, Shield, Image, Link2, CreditCard,
  CheckCircle, Star, MessageSquare, Zap, Tag,
  FileText, RotateCcw, LogOut, Store, TrendingUp, Eye, Trophy, XCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useViewMode } from "@/contexts/ViewModeContext";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { useRealtimeKycNotifications } from "@/hooks/useRealtimeKycNotifications";
import SellerLeaderboard from "@/components/admin/SellerLeaderboard";
const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  href: string;
  color: string;
}

const ActionCard = ({ icon, title, description, badge, badgeVariant = "default", href, color }: ActionCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98] border-border bg-card min-h-[100px] flex flex-col justify-center"
      onClick={() => navigate(href)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${color} shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs shrink-0">
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { enableCustomerView } = useViewMode();
  const { stats, isLoading } = useAdminDashboardAnalytics();
  
  // Enable real-time KYC notifications for admin
  useRealtimeKycNotifications();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleViewAsCustomer = () => {
    enableCustomerView();
    navigate("/");
  };

  const quickStats = [
    { label: "Revenue", value: formatPKR(stats?.totalRevenue || 0), color: "text-emerald-600" },
    { label: "Orders", value: stats?.totalOrders?.toString() || "0", color: "text-primary" },
    { label: "Pending", value: stats?.pendingApprovals?.toString() || "0", color: "text-amber-600" },
  ];

  const commandCenterActions = [
    { icon: <Users size={20} className="text-blue-600" />, title: "Customers", description: "Manage customers", href: "/admin/users", color: "bg-blue-100" },
    { icon: <Store size={20} className="text-green-600" />, title: "Sellers", description: "Manage sellers", href: "/admin/sellers", color: "bg-green-100" },
    { icon: <Shield size={20} className="text-purple-600" />, title: "Roles", description: "Manage permissions", href: "/admin/roles", color: "bg-purple-100" },
    { icon: <CheckCircle size={20} className="text-emerald-600" />, title: "Seller KYC", description: "Review verifications", badge: stats?.pendingApprovals?.toString(), badgeVariant: "destructive" as const, href: "/admin/seller-kyc", color: "bg-emerald-100" },
    { icon: <Package size={20} className="text-orange-600" />, title: "Approvals", description: "Product approvals", href: "/admin/approvals", color: "bg-orange-100" },
  ];

  const managementActions = [
    { icon: <ShoppingBag size={20} className="text-primary" />, title: "Orders", description: "View all orders", href: "/admin/orders", color: "bg-primary/10" },
    { icon: <XCircle size={20} className="text-destructive" />, title: "Cancelled", description: "View cancellations", href: "/admin/cancelled", color: "bg-destructive/10" },
    { icon: <Package size={20} className="text-teal-600" />, title: "Products", description: "Product catalog", href: "/admin/products", color: "bg-teal-100" },
    { icon: <Tag size={20} className="text-pink-600" />, title: "Categories", description: "Manage categories", href: "/admin/categories", color: "bg-pink-100" },
    { icon: <CreditCard size={20} className="text-emerald-600" />, title: "Payouts", description: "Seller payouts", href: "/admin/payouts", color: "bg-emerald-100" },
    { icon: <RotateCcw size={20} className="text-red-600" />, title: "Returns", description: "Handle returns", href: "/admin/returns", color: "bg-red-100" },
    { icon: <Zap size={20} className="text-yellow-600" />, title: "Flash Sales", description: "Manage flash sales", href: "/admin/flash-sales", color: "bg-yellow-100" },
  ];

  const contentActions = [
    { icon: <Image size={20} className="text-indigo-600" />, title: "Banners", description: "Hero banners", href: "/admin/banners", color: "bg-indigo-100" },
    { icon: <Link2 size={20} className="text-cyan-600" />, title: "Site Settings", description: "Social & contact", href: "/admin/site-settings", color: "bg-cyan-100" },
    { icon: <Star size={20} className="text-amber-600" />, title: "Reviews", description: "Moderate reviews", href: "/admin/reviews", color: "bg-amber-100" },
    { icon: <MessageSquare size={20} className="text-violet-600" />, title: "Q&A", description: "Product Q&A", href: "/admin/qa", color: "bg-violet-100" },
    { icon: <BarChart3 size={20} className="text-blue-600" />, title: "Analytics", description: "View insights", href: "/admin/analytics", color: "bg-blue-100" },
    { icon: <Settings size={20} className="text-slate-600" />, title: "Settings", description: "App settings", href: "/admin/settings", color: "bg-slate-100" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Welcome, {profile?.full_name || "Admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewAsCustomer}
              className="h-9 gap-1.5"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">View as Customer</span>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLogout}
              className="h-9 gap-1.5"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : (
            quickStats.map((stat, index) => (
              <Card key={index} className="p-3 text-center border-border">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            ))
          )}
        </div>

        {/* Command Center */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            Command Center
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {commandCenterActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Order & Product Management */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package size={16} className="text-primary" />
            Management
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {managementActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Content & Settings */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            Content & Settings
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {contentActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Seller Leaderboard */}
        <SellerLeaderboard limit={5} />
      </div>
    </div>
  );
};

export default AdminDashboard;

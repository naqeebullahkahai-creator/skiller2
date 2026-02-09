import { useNavigate } from "react-router-dom";
import { 
  Package, ShoppingBag, Wallet, BarChart3, 
  Settings, MessageSquare, Star, Zap, Tag,
  Plus, FileUp, RotateCcw, LogOut, Store,
  Shield, HelpCircle, XCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerAnalytics } from "@/hooks/useSellerAnalytics";
import { useSellerWallet } from "@/hooks/useSellerWallet";
import { useOrders } from "@/hooks/useOrders";
import { useSellerKyc } from "@/hooks/useSellerKyc";

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
  disabled?: boolean;
}

const ActionCard = ({ icon, title, description, badge, badgeVariant = "default", href, color, disabled }: ActionCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-300 border-border bg-card min-h-[100px] flex flex-col justify-center ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg active:scale-[0.98]"
      }`}
      onClick={() => !disabled && navigate(href)}
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

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  // Strict role isolation - no customer view
  const { totalStats, isLoading: analyticsLoading } = useSellerAnalytics();
  const { wallet, isLoading: walletLoading } = useSellerWallet();
  const { orders, isLoading: ordersLoading } = useOrders({ role: "seller", sellerId: user?.id });
  const { sellerProfile, isVerified, isPending } = useSellerKyc();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Removed: handleViewStorefront - strict role isolation

  const pendingOrders = orders?.filter(o => o.order_status === "pending")?.length || 0;
  const todaySales = totalStats?.totalEarnings || 0;
  const walletBalance = wallet?.current_balance || 0;

  const isLoading = analyticsLoading || walletLoading || ordersLoading;

  const quickStats = [
    { label: "Today's Sales", value: formatPKR(todaySales), color: "text-green-600" },
    { label: "Pending", value: pendingOrders.toString(), color: "text-orange-600" },
    { label: "Wallet", value: formatPKR(walletBalance), color: "text-blue-600" },
  ];

  const quickActions = [
    { icon: <Shield size={20} className="text-purple-600" />, title: "KYC Verification", description: isVerified ? "Verified ✓" : isPending ? "Under Review" : "Complete Now", href: "/seller/kyc", color: "bg-purple-100", badge: !isVerified ? "Required" : undefined, badgeVariant: "destructive" as const },
    { icon: <Plus size={20} className="text-green-600" />, title: "Add Product", description: "List new product", href: "/seller/products/new", color: "bg-green-100", disabled: !isVerified },
    { icon: <Package size={20} className="text-blue-600" />, title: "My Products", description: "Manage inventory", href: "/seller/products", color: "bg-blue-100", disabled: !isVerified },
    { icon: <ShoppingBag size={20} className="text-primary" />, title: "Orders", description: "View & manage orders", badge: pendingOrders > 0 ? pendingOrders.toString() : undefined, badgeVariant: "destructive" as const, href: "/seller/orders", color: "bg-primary/10", disabled: !isVerified },
  ];

  const businessActions = [
    { icon: <Wallet size={20} className="text-emerald-600" />, title: "Wallet", description: "Earnings & payouts", href: "/seller/wallet", color: "bg-emerald-100", disabled: !isVerified },
    { icon: <BarChart3 size={20} className="text-indigo-600" />, title: "Analytics", description: "Sales insights", href: "/seller/analytics", color: "bg-indigo-100", disabled: !isVerified },
    { icon: <MessageSquare size={20} className="text-cyan-600" />, title: "Messages", description: "Customer chat", href: "/seller/messages", color: "bg-cyan-100", disabled: !isVerified },
    { icon: <Star size={20} className="text-amber-600" />, title: "Reviews", description: "Customer feedback", href: "/seller/reviews", color: "bg-amber-100" },
  ];

  const moreActions = [
    { icon: <Tag size={20} className="text-pink-600" />, title: "Vouchers", description: "Discount codes", href: "/seller/vouchers", color: "bg-pink-100", disabled: !isVerified },
    { icon: <Zap size={20} className="text-yellow-600" />, title: "Flash Sale", description: "Nominate products", href: "/seller/flash-sale", color: "bg-yellow-100", disabled: !isVerified },
    { icon: <FileUp size={20} className="text-slate-600" />, title: "Bulk Upload", description: "Import products", href: "/seller/bulk-upload", color: "bg-slate-100", disabled: !isVerified },
    { icon: <RotateCcw size={20} className="text-red-600" />, title: "Returns", description: "Handle returns", href: "/seller/returns", color: "bg-red-100", disabled: !isVerified },
    { icon: <XCircle size={20} className="text-destructive" />, title: "Cancelled", description: "View cancelled orders", href: "/seller/cancelled", color: "bg-destructive/10", disabled: !isVerified },
    { icon: <HelpCircle size={20} className="text-violet-600" />, title: "Q&A", description: "Answer questions", href: "/seller/qa", color: "bg-violet-100", disabled: !isVerified },
    { icon: <Settings size={20} className="text-gray-600" />, title: "Settings", description: "Account settings", href: "/seller/settings", color: "bg-gray-100" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Seller Center</h1>
            <p className="text-xs text-muted-foreground">Welcome, {profile?.full_name || "Seller"}</p>
          </div>
          <div className="flex items-center gap-2">
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
        {/* KYC Alert */}
        {!isVerified && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <Shield className="text-amber-600 shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 text-sm">
                  {isPending ? "KYC Under Review" : "Complete KYC Verification"}
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  {isPending 
                    ? "Your documents are being reviewed. This usually takes 24-48 hours."
                    : "Verify your identity to unlock all seller features."}
                </p>
              </div>
              {!isPending && (
                <Button 
                  size="sm" 
                  className="shrink-0"
                  onClick={() => navigate("/seller/kyc")}
                >
                  Verify Now
                </Button>
              )}
            </div>
          </Card>
        )}

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

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Business Hub */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Business Hub
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {businessActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* More Tools */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            More Tools
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {moreActions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

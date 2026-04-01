import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, ShoppingBag, Package, BarChart3, 
  Settings, Shield, Image, CreditCard,
  CheckCircle, Star, MessageSquare, Zap, Tag,
  RotateCcw, LogOut, Store, TrendingUp, XCircle,
  Wallet, Upload, Bell, FileText, Percent,
  Lock, Wrench, Globe, Megaphone, DollarSign,
  AlertTriangle, ChevronRight, Headphones,
  Layers, Receipt, BadgeCheck, BookOpen,
  Home, User, LayoutGrid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { useRealtimeKycNotifications } from "@/hooks/useRealtimeKycNotifications";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";
import { cn } from "@/lib/utils";
import { useState } from "react";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

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
      className="p-3 cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98] border-border bg-card"
      onClick={() => navigate(href)}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground text-sm truncate">{title}</h3>
            {badge && <Badge variant={badgeVariant} className="text-[10px] shrink-0">{badge}</Badge>}
          </div>
          {description && <p className="text-[11px] text-muted-foreground truncate">{description}</p>}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Card>
  );
};

// Bottom nav tabs for admin mobile
type AdminTab = "home" | "modules" | "finance" | "more";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout, user } = useAuth();
  const { stats, isLoading } = useAdminDashboardAnalytics();
  const counts = useAdminSidebarCounts();
  useRealtimeKycNotifications();

  const [activeTab, setActiveTab] = useState<AdminTab>("home");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "A";
  };

  const quickStats = [
    { label: "Revenue", value: formatPKR(stats?.totalRevenue || 0), color: "text-emerald-600" },
    { label: "Orders", value: stats?.totalOrders?.toString() || "0", color: "text-primary" },
    { label: "Pending", value: stats?.pendingApprovals?.toString() || "0", color: "text-amber-600" },
  ];

  // ── Module Cards ──
  const moduleDashboards: ActionCardProps[] = [
    { icon: <Store size={20} className="text-white" />, title: "Seller Module", description: "KYC, Products, Payouts", badge: counts.pendingKyc ? counts.pendingKyc.toString() : undefined, badgeVariant: "destructive", href: "/admin/module/sellers", color: "bg-emerald-600" },
    { icon: <Users size={20} className="text-white" />, title: "Customer Module", description: "Users, Orders, Deposits", badge: counts.pendingCustomerDeposits ? counts.pendingCustomerDeposits.toString() : undefined, badgeVariant: "destructive", href: "/admin/module/customers", color: "bg-blue-600" },
    { icon: <Headphones size={20} className="text-white" />, title: "Agent Module", description: "Chat, Salaries, Payouts", badge: counts.pendingPayouts ? counts.pendingPayouts.toString() : undefined, badgeVariant: "destructive", href: "/admin/module/agents", color: "bg-violet-600" },
  ];

  // ── Orders ──
  const orderActions: ActionCardProps[] = [
    { icon: <ShoppingBag size={18} className="text-primary" />, title: "All Orders", description: "View all orders", href: "/admin/orders", color: "bg-primary/10" },
    { icon: <Store size={18} className="text-emerald-600" />, title: "Direct Orders", description: "Admin's own sales", href: "/admin/orders/direct", color: "bg-emerald-100" },
    { icon: <XCircle size={18} className="text-destructive" />, title: "Cancellations", description: "Cancelled orders", href: "/admin/cancellations", color: "bg-destructive/10" },
  ];

  // ── Products ──
  const productActions: ActionCardProps[] = [
    { icon: <Package size={18} className="text-teal-600" />, title: "Products", description: "All products", href: "/admin/products", color: "bg-teal-100" },
    { icon: <BadgeCheck size={18} className="text-orange-600" />, title: "Approvals", description: "Product approvals", badge: counts.pendingApprovals?.toString(), badgeVariant: "destructive", href: "/admin/approvals", color: "bg-orange-100" },
    { icon: <Tag size={18} className="text-pink-600" />, title: "Categories", description: "Manage categories", href: "/admin/categories", color: "bg-pink-100" },
  ];

  // ── Financial ──
  const financeActions: ActionCardProps[] = [
    { icon: <Wallet size={18} className="text-violet-600" />, title: "Admin Wallet", description: "Platform earnings", href: "/admin/wallet", color: "bg-violet-100" },
    { icon: <DollarSign size={18} className="text-amber-600" />, title: "Commissions", description: "Commission wallet", href: "/admin/commission-wallet", color: "bg-amber-100" },
    { icon: <Receipt size={18} className="text-blue-600" />, title: "Subscriptions", description: "Fee wallet", href: "/admin/subscription-wallet", color: "bg-blue-100" },
    { icon: <Store size={18} className="text-emerald-600" />, title: "Store Wallet", description: "Store earnings", href: "/admin/store/wallet", color: "bg-emerald-100" },
    { icon: <CreditCard size={18} className="text-cyan-600" />, title: "Payment Methods", description: "Bank accounts", href: "/admin/payment-methods", color: "bg-cyan-100" },
    { icon: <Settings size={18} className="text-slate-600" />, title: "Payment Settings", description: "COD, Wallet etc", href: "/admin/payment-settings", color: "bg-slate-100" },
  ];

  // ── Marketing ──
  const marketingActions: ActionCardProps[] = [
    { icon: <Zap size={18} className="text-yellow-600" />, title: "Flash Sales", description: "Campaigns", href: "/admin/flash-sales", color: "bg-yellow-100" },
    { icon: <Tag size={18} className="text-purple-600" />, title: "Vouchers", description: "Discount codes", href: "/admin/vouchers", color: "bg-purple-100" },
    { icon: <Image size={18} className="text-indigo-600" />, title: "Banners", description: "Hero banners", href: "/admin/banners", color: "bg-indigo-100" },
  ];

  // ── Settings / More ──
  const settingsActions: ActionCardProps[] = [
    { icon: <Wrench size={18} className="text-slate-600" />, title: "All Settings", description: "Platform settings", href: "/admin/all-settings", color: "bg-slate-100" },
    { icon: <Globe size={18} className="text-cyan-600" />, title: "Site Settings", description: "Social & contact", href: "/admin/site-settings", color: "bg-cyan-100" },
    { icon: <BookOpen size={18} className="text-teal-600" />, title: "Content Manager", description: "Site content", href: "/admin/content-manager", color: "bg-teal-100" },
    { icon: <Image size={18} className="text-pink-600" />, title: "Brand Assets", description: "Logo & branding", href: "/admin/brand-assets", color: "bg-pink-100" },
    { icon: <Star size={18} className="text-amber-600" />, title: "Reviews", description: "Moderate reviews", href: "/admin/reviews", color: "bg-amber-100" },
    { icon: <MessageSquare size={18} className="text-blue-600" />, title: "Q&A", description: "Product Q&A", href: "/admin/qa", color: "bg-blue-100" },
    { icon: <Bell size={18} className="text-rose-600" />, title: "Notifications", description: "Send notifications", href: "/admin/notifications", color: "bg-rose-100" },
    { icon: <BarChart3 size={18} className="text-violet-600" />, title: "Analytics", description: "Platform insights", href: "/admin/analytics", color: "bg-violet-100" },
    { icon: <Lock size={18} className="text-red-600" />, title: "Security", description: "Audit & logs", href: "/admin/security", color: "bg-red-100" },
    { icon: <Shield size={18} className="text-purple-600" />, title: "Roles & Staff", description: "Permissions", href: "/admin/roles", color: "bg-purple-100" },
    { icon: <Store size={18} className="text-green-600" />, title: "Admin Store", description: "Your own store", href: "/admin/store", color: "bg-green-100" },
    { icon: <FileText size={18} className="text-indigo-600" />, title: "Platform Blueprint", description: "System overview", href: "/admin/platform-blueprint", color: "bg-indigo-100" },
    { icon: <Smartphone size={18} className="text-green-600" />, title: "APK Builder", description: "Native app guide", href: "/admin/apk-build", color: "bg-green-100" },
  ];

  const renderHome = () => (
    <div className="space-y-5">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : (
          quickStats.map((stat, i) => (
            <Card key={i} className="p-3 text-center border-border">
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
            </Card>
          ))
        )}
      </div>

      {/* Management Modules */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">📊 Management Modules</h2>
        <div className="space-y-2">
          {moduleDashboards.map((action, i) => (
            <ActionCard key={i} {...action} />
          ))}
        </div>
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">📦 Orders</h2>
        <div className="grid grid-cols-2 gap-2">
          {orderActions.map((a, i) => <ActionCard key={i} {...a} />)}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">🛍️ Products</h2>
        <div className="grid grid-cols-2 gap-2">
          {productActions.map((a, i) => <ActionCard key={i} {...a} />)}
        </div>
      </div>
    </div>
  );

  const renderModules = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">📊 Management Modules</h2>
        <div className="space-y-2">
          {moduleDashboards.map((action, i) => (
            <ActionCard key={i} {...action} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">💰 Financial Controls</h2>
        <div className="grid grid-cols-2 gap-2">
          {financeActions.map((a, i) => <ActionCard key={i} {...a} />)}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">🔥 Marketing</h2>
        <div className="grid grid-cols-2 gap-2">
          {marketingActions.map((a, i) => <ActionCard key={i} {...a} />)}
        </div>
      </div>
    </div>
  );

  const renderMore = () => (
    <div className="space-y-5">
      {/* Account Card */}
      <Card className="p-4 border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{profile?.full_name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <Badge className="mt-1 text-[10px]">Super Admin</Badge>
          </div>
        </div>
      </Card>

      {/* Settings */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-2">⚙️ Settings & Content</h2>
        <div className="grid grid-cols-2 gap-2">
          {settingsActions.map((a, i) => <ActionCard key={i} {...a} />)}
        </div>
      </div>

      {/* Logout */}
      <Button 
        variant="destructive" 
        className="w-full gap-2" 
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Logout
      </Button>
    </div>
  );

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "modules", label: "Modules", icon: LayoutGrid },
    { id: "finance", label: "Finance", icon: Wallet },
    { id: "more", label: "More", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">FANZON Admin</h1>
            <p className="text-xs text-primary-foreground/70">Welcome, {profile?.full_name || "Admin"}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")} 
            className="text-primary-foreground hover:bg-primary-foreground/20 h-9 w-9"
          >
            <Store size={18} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === "home" && renderHome()}
        {activeTab === "modules" && renderModules()}
        {activeTab === "finance" && renderFinance()}
        {activeTab === "more" && renderMore()}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div className="bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-around h-14">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center flex-1 h-full active:scale-[0.92] transition-all duration-150"
                >
                  <tab.icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}
                  />
                  <span className={cn("text-[10px] font-medium mt-0.5", active ? "text-primary font-semibold" : "text-muted-foreground")}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;

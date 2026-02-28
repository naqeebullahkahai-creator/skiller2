import { useNavigate } from "react-router-dom";
import { 
  Users, ShoppingBag, Package, BarChart3, 
  Settings, Shield, Image, CreditCard,
  CheckCircle, Star, MessageSquare, Zap, Tag,
  RotateCcw, LogOut, Store, TrendingUp, XCircle,
  Wallet, Upload, Bell, FileText, Percent,
  Lock, Wrench, Globe, Megaphone, DollarSign,
  AlertTriangle, ChevronRight, Headphones,
  Layers, Receipt, BadgeCheck, BookOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { useRealtimeKycNotifications } from "@/hooks/useRealtimeKycNotifications";
import { cn } from "@/lib/utils";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { stats, isLoading } = useAdminDashboardAnalytics();
  useRealtimeKycNotifications();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const quickStats = [
    { label: "Revenue", value: formatPKR(stats?.totalRevenue || 0), color: "text-emerald-600" },
    { label: "Orders", value: stats?.totalOrders?.toString() || "0", color: "text-primary" },
    { label: "Pending", value: stats?.pendingApprovals?.toString() || "0", color: "text-amber-600" },
  ];

  // ── Users & Verification ──
  const userActions: ActionCardProps[] = [
    { icon: <Users size={18} className="text-blue-600" />, title: "Customers", description: "All customers", href: "/admin-app/users", color: "bg-blue-100" },
    { icon: <Store size={18} className="text-green-600" />, title: "Sellers", description: "Seller directory", href: "/admin-app/sellers", color: "bg-green-100" },
    { icon: <CheckCircle size={18} className="text-emerald-600" />, title: "Seller KYC", description: "Review verifications", badge: stats?.pendingApprovals?.toString(), badgeVariant: "destructive", href: "/admin-app/seller-kyc", color: "bg-emerald-100" },
    { icon: <Shield size={18} className="text-purple-600" />, title: "Roles & Staff", description: "Permissions", href: "/admin-app/roles", color: "bg-purple-100" },
  ];

  // ── Orders & Returns ──
  const orderActions: ActionCardProps[] = [
    { icon: <ShoppingBag size={18} className="text-primary" />, title: "All Orders", description: "View all orders", href: "/admin-app/orders", color: "bg-primary/10" },
    { icon: <Store size={18} className="text-emerald-600" />, title: "Direct Orders", description: "Admin's own sales", href: "/admin-app/orders/direct", color: "bg-emerald-100" },
    { icon: <Percent size={18} className="text-amber-600" />, title: "Vendor Orders", description: "Seller marketplace", href: "/admin-app/orders/vendor", color: "bg-amber-100" },
    { icon: <XCircle size={18} className="text-destructive" />, title: "Cancellations", description: "Cancelled orders", href: "/admin-app/cancellations", color: "bg-destructive/10" },
    { icon: <RotateCcw size={18} className="text-red-600" />, title: "Returns", description: "Handle returns", href: "/admin-app/returns", color: "bg-red-100" },
  ];

  // ── Products & Catalog ──
  const productActions: ActionCardProps[] = [
    { icon: <Package size={18} className="text-teal-600" />, title: "Product Catalog", description: "All products", href: "/admin-app/products", color: "bg-teal-100" },
    { icon: <BadgeCheck size={18} className="text-orange-600" />, title: "Approvals", description: "Product approvals", href: "/admin-app/approvals", color: "bg-orange-100" },
    { icon: <Tag size={18} className="text-pink-600" />, title: "Categories", description: "Manage categories", href: "/admin-app/categories", color: "bg-pink-100" },
    { icon: <Upload size={18} className="text-indigo-600" />, title: "Bulk Uploads", description: "Upload logs", href: "/admin-app/bulk-uploads", color: "bg-indigo-100" },
  ];

  // ── Financial Controls ──
  const financeActions: ActionCardProps[] = [
    { icon: <Wallet size={18} className="text-violet-600" />, title: "Admin Wallet", description: "Platform earnings", href: "/admin-app/wallet", color: "bg-violet-100" },
    { icon: <CreditCard size={18} className="text-emerald-600" />, title: "Payouts", description: "Seller payouts", href: "/admin-app/payouts", color: "bg-emerald-100" },
    { icon: <DollarSign size={18} className="text-amber-600" />, title: "Commission", description: "Commission rates", href: "/admin-app/commission-management", color: "bg-amber-100" },
    { icon: <Receipt size={18} className="text-blue-600" />, title: "Subscriptions", description: "Fee management", href: "/admin-app/subscriptions", color: "bg-blue-100" },
    { icon: <CreditCard size={18} className="text-cyan-600" />, title: "Payment Methods", description: "Bank accounts", href: "/admin-app/payment-methods", color: "bg-cyan-100" },
    { icon: <Settings size={18} className="text-slate-600" />, title: "Payment Settings", description: "COD, Wallet etc", href: "/admin-app/payment-settings", color: "bg-slate-100" },
    { icon: <TrendingUp size={18} className="text-green-600" />, title: "Balance Adjust", description: "Add/deduct funds", href: "/admin-app/balance-adjustments", color: "bg-green-100" },
  ];

  // ── Deposits ──
  const depositActions: ActionCardProps[] = [
    { icon: <FileText size={18} className="text-emerald-600" />, title: "Seller Deposits", description: "Seller deposit requests", href: "/admin-app/deposits/sellers", color: "bg-emerald-100" },
    { icon: <FileText size={18} className="text-blue-600" />, title: "User Deposits", description: "Customer deposits", href: "/admin-app/deposits/users", color: "bg-blue-100" },
    { icon: <Settings size={18} className="text-slate-600" />, title: "Deposit Settings", description: "Configure deposits", href: "/admin-app/deposits/settings", color: "bg-slate-100" },
  ];

  // ── Marketing & Promotions ──
  const marketingActions: ActionCardProps[] = [
    { icon: <Zap size={18} className="text-yellow-600" />, title: "Flash Sales", description: "Campaigns", href: "/admin-app/flash-sales", color: "bg-yellow-100" },
    { icon: <Zap size={18} className="text-orange-600" />, title: "Flash Nominations", description: "Seller applications", href: "/admin-app/flash-nominations", color: "bg-orange-100" },
    { icon: <Tag size={18} className="text-purple-600" />, title: "Vouchers", description: "Discount codes", href: "/admin-app/vouchers", color: "bg-purple-100" },
    { icon: <Image size={18} className="text-indigo-600" />, title: "Banners", description: "Hero banners", href: "/admin-app/banners", color: "bg-indigo-100" },
  ];

  // ── Content & Settings ──
  const settingsActions: ActionCardProps[] = [
    { icon: <Settings size={18} className="text-slate-600" />, title: "All Settings", description: "Platform settings", href: "/admin-app/settings", color: "bg-slate-100" },
    { icon: <Globe size={18} className="text-cyan-600" />, title: "Site Settings", description: "Social & contact", href: "/admin-app/site-settings", color: "bg-cyan-100" },
    { icon: <BookOpen size={18} className="text-teal-600" />, title: "Content Manager", description: "Site content", href: "/admin-app/content-manager", color: "bg-teal-100" },
    { icon: <Image size={18} className="text-pink-600" />, title: "Brand Assets", description: "Logo & branding", href: "/admin-app/brand-assets", color: "bg-pink-100" },
    { icon: <MessageSquare size={18} className="text-violet-600" />, title: "Chat Shortcuts", description: "Quick replies", href: "/admin-app/chat-shortcuts", color: "bg-violet-100" },
    { icon: <Star size={18} className="text-amber-600" />, title: "Reviews", description: "Moderate reviews", href: "/admin-app/reviews", color: "bg-amber-100" },
    { icon: <MessageSquare size={18} className="text-blue-600" />, title: "Q&A", description: "Product Q&A", href: "/admin-app/qa", color: "bg-blue-100" },
    { icon: <BarChart3 size={18} className="text-violet-600" />, title: "Analytics", description: "Platform insights", href: "/admin-app/analytics", color: "bg-violet-100" },
    { icon: <Bell size={18} className="text-rose-600" />, title: "Notifications", description: "Send notifications", href: "/admin-app/notifications", color: "bg-rose-100" },
    { icon: <Lock size={18} className="text-red-600" />, title: "Security", description: "Audit & logs", href: "/admin-app/security", color: "bg-red-100" },
  ];

  const sections = [
    { title: "👥 Users & Verification", items: userActions },
    { title: "📦 Orders & Returns", items: orderActions },
    { title: "🛍️ Products & Catalog", items: productActions },
    { title: "💰 Financial Controls", items: financeActions },
    { title: "🏦 Deposit Management", items: depositActions },
    { title: "🔥 Marketing & Promotions", items: marketingActions },
    { title: "⚙️ Content & Settings", items: settingsActions },
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
          <Button variant="destructive" size="sm" onClick={handleLogout} className="h-9 gap-1.5">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
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

        {/* All Sections */}
        {sections.map((section, si) => (
          <div key={si}>
            <h2 className="text-sm font-semibold text-foreground mb-2">{section.title}</h2>
            <div className="grid grid-cols-2 gap-2">
              {section.items.map((action, ai) => (
                <ActionCard key={ai} {...action} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

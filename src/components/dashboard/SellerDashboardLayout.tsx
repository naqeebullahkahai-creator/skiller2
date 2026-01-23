import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Store,
  Plus,
  ShieldCheck,
  AlertCircle,
  Wallet,
  MessageSquare,
  BarChart3,
  Zap,
  Star,
  Ticket,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import { useUnreadCount } from "@/hooks/useMessaging";

const sellerLinks = [
  { name: "Dashboard", href: "/seller-center", icon: LayoutDashboard },
  { name: "KYC Verification", href: "/seller-center/kyc", icon: ShieldCheck },
  { name: "My Products", href: "/seller-center/products", icon: Package },
  { name: "Add Product", href: "/seller-center/products/new", icon: Plus },
  { name: "Bulk Upload", href: "/seller-center/bulk-upload", icon: Upload },
  { name: "Orders", href: "/seller-center/orders", icon: ShoppingCart },
  { name: "Vouchers", href: "/seller-center/vouchers", icon: Ticket },
  { name: "Reviews", href: "/seller-center/reviews", icon: Star },
  { name: "Flash Sales", href: "/seller-center/flash-sales", icon: Zap },
  { name: "Analytics", href: "/seller-center/analytics", icon: BarChart3 },
  { name: "Messages", href: "/seller-center/messages", icon: MessageSquare },
  { name: "Wallet", href: "/seller-center/wallet", icon: Wallet },
  { name: "Settings", href: "/seller-center/settings", icon: Settings },
];

const SellerDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { isVerified, isPending, isRejected, hasSubmittedKyc } = useSellerKyc();
  const { unreadCount } = useUnreadCount();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const getVerificationBadge = () => {
    if (isVerified) {
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          <ShieldCheck className="w-3 h-3 mr-1" />
          {sidebarOpen ? "Verified Seller" : "V"}
        </Badge>
      );
    }
    if (isPending) {
      return (
        <Badge variant="outline" className="border-primary text-primary">
          <AlertCircle className="w-3 h-3 mr-1" />
          {sidebarOpen ? "Pending Review" : "P"}
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="destructive">
          {sidebarOpen ? "Rejected" : "R"}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
        {sidebarOpen ? "Not Verified" : "NV"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">FANZON</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-slate-800"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>

        {/* Verification Status Badge */}
        <div className="p-4 border-b border-slate-700">
          {getVerificationBadge()}
        </div>

        {/* Quick Add Product Button - Only for verified sellers */}
        {sidebarOpen && isVerified && (
          <div className="p-4 border-b border-slate-700">
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => navigate("/seller-center/products/new")}
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
          </div>
        )}

        {/* KYC Required Alert for unverified sellers */}
        {sidebarOpen && !isVerified && !isPending && (
          <div className="p-4 border-b border-slate-700">
            <Button 
              className="w-full"
              variant="outline"
              onClick={() => navigate("/seller-center/kyc")}
            >
              <ShieldCheck size={16} className="mr-2" />
              Complete KYC
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sellerLinks.map((link) => {
            const isActive = location.pathname === link.href || 
              (link.href !== "/seller-center" && link.href !== "/seller-center/kyc" && location.pathname.startsWith(link.href));
            
            // Show KYC link prominently if not verified
            const isKycLink = link.href === "/seller-center/kyc";
            const showKycHighlight = isKycLink && !isVerified;
            const isMessagesLink = link.href === "/seller-center/messages";
            
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : showKycHighlight
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <link.icon size={20} />
                {sidebarOpen && <span>{link.name}</span>}
                {showKycHighlight && sidebarOpen && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    Required
                  </Badge>
                )}
                {isMessagesLink && unreadCount > 0 && (
                  <Badge className="ml-auto bg-destructive text-destructive-foreground text-xs h-5 min-w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-4 border-t border-slate-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Store size={20} />
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {profile?.full_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{profile?.full_name || "Seller"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/seller-center/kyc")}>
                  <ShieldCheck size={16} className="mr-2" />
                  KYC Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/seller-center/settings")}>
                  <Settings size={16} className="mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerDashboardLayout;

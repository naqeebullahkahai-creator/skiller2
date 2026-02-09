import { useState, useEffect } from "react";
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
  Store, // kept for sidebar icon
  Plus,
  ShieldCheck,
  AlertCircle,
  Wallet,
  MessageSquare,
  BarChart3,
  Zap,
  Star,
  Ticket,
  Upload,
  Menu,
  RotateCcw,
  XCircle,
  HelpCircle,
  Home,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import { useUnreadCount } from "@/hooks/useMessaging";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardProvider } from "@/contexts/DashboardContext";

const sellerLinks = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "KYC Verification", href: "/seller/kyc", icon: ShieldCheck },
  { name: "My Products", href: "/seller/products", icon: Package },
  { name: "Add Product", href: "/seller/products/new", icon: Plus },
  { name: "Bulk Upload", href: "/seller/bulk-upload", icon: Upload },
  { name: "Orders", href: "/seller/orders", icon: ShoppingCart },
  { name: "Cancelled Orders", href: "/seller/cancelled", icon: XCircle },
  { name: "Customer Q&A", href: "/seller/qa", icon: HelpCircle },
  { name: "Vouchers", href: "/seller/vouchers", icon: Ticket },
  { name: "Reviews", href: "/seller/reviews", icon: Star },
  { name: "Flash Sales", href: "/seller/flash-sale", icon: Zap },
  { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { name: "Messages", href: "/seller/messages", icon: MessageSquare },
  { name: "Wallet", href: "/seller/wallet", icon: Wallet },
  { name: "Returns", href: "/seller/returns", icon: RotateCcw },
  { name: "Settings", href: "/seller/settings", icon: Settings },
];

const SellerDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  // Strict role isolation - no customer view
  const { isVerified, isPending, isRejected } = useSellerKyc();
  const { unreadCount } = useUnreadCount();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Removed: handleViewStorefront - strict role isolation

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
      return <Badge variant="destructive">{sidebarOpen ? "Rejected" : "R"}</Badge>;
    }
    return (
      <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
        {sidebarOpen ? "Not Verified" : "NV"}
      </Badge>
    );
  };

  // Bottom nav items for mobile
  const bottomNavItems = [
    { icon: Home, label: "Home", href: "/seller/dashboard" },
    { icon: Package, label: "Products", href: "/seller/products" },
    { icon: ShoppingCart, label: "Orders", href: "/seller/orders" },
    { icon: Wallet, label: "Wallet", href: "/seller/wallet" },
    { icon: Settings, label: "More", href: "/seller/settings" },
  ];

  const isBottomActive = (href: string) => {
    if (href === "/seller/dashboard") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="p-4 border-b border-slate-700">
        {getVerificationBadge()}
      </div>

      {isVerified && (
        <div className="p-4 border-b border-slate-700">
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => { navigate("/seller/products/new"); onNavigate?.(); }}>
            <Plus size={16} className="mr-2" />Add Product
          </Button>
        </div>
      )}

      {!isVerified && !isPending && (
        <div className="p-4 border-b border-slate-700">
          <Button className="w-full" variant="outline" onClick={() => { navigate("/seller/kyc"); onNavigate?.(); }}>
            <ShieldCheck size={16} className="mr-2" />Complete KYC
          </Button>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sellerLinks.map((link) => {
          const isActive = location.pathname === link.href || 
            (link.href !== "/seller/dashboard" && link.href !== "/seller/kyc" && location.pathname.startsWith(link.href));
          const isKycLink = link.href === "/seller/kyc";
          const showKycHighlight = isKycLink && !isVerified;
          const isMessagesLink = link.href === "/seller/messages";
          
          return (
            <Link
              key={link.name}
              to={link.href}
              onClick={onNavigate}
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
              <span className="text-sm">{link.name}</span>
              {showKycHighlight && (
                <Badge variant="destructive" className="ml-auto text-xs">Required</Badge>
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

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => { handleLogout(); onNavigate?.(); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
        >
          <LogOut size={20} /><span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-muted">
        {/* Mobile Header - Native App Style */}
        <header className="md:hidden sticky top-0 z-50 bg-primary safe-area-top">
          <div className="flex items-center justify-between h-14 px-3">
            <div className="flex items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="text-primary-foreground p-1.5 active:scale-95 transition-transform">
                    <Menu size={22} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-slate-900 border-slate-700">
                  {/* Drawer Header */}
                  <div className="p-4 bg-primary">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary-foreground/30">
                        <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-semibold">
                          {profile?.full_name?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-primary-foreground">{profile?.full_name || "Seller"}</p>
                        <div className="mt-1">{getVerificationBadge()}</div>
                      </div>
                    </div>
                  </div>
                  <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
              <span className="text-primary-foreground font-bold text-lg">Seller Center</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="text-primary-foreground p-2 active:scale-95 transition-transform rounded-full hover:bg-primary-foreground/10 relative">
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-white text-[10px] font-bold rounded-full px-1 bg-destructive">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <button className="text-primary-foreground p-2 active:scale-95 transition-transform rounded-full hover:bg-primary-foreground/10">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 hidden md:flex md:flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
            {sidebarOpen && (
              <Link to="/seller/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">FANZON</span>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-slate-800">
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          </div>
          <SidebarNav />
        </aside>

        {/* Main Content */}
        <div className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          "md:ml-64",
          !sidebarOpen && "md:ml-20"
        )}>
          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-30 h-16 bg-background border-b items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-9 w-64" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative"><Bell size={20} /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{profile?.full_name || "Seller"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => navigate("/seller/kyc")}>
                    <ShieldCheck size={16} className="mr-2" />KYC Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/seller/settings")}>
                    <Settings size={16} className="mr-2" />Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-3 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Navigation - Native App Style */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
          <div className="bg-card/90 backdrop-blur-xl border-t border-border/50">
            <div className="flex items-center justify-around h-16">
              {bottomNavItems.map((item) => {
                const active = isBottomActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center flex-1 h-full relative",
                      "active:scale-[0.92] transition-all duration-200"
                    )}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={active ? 2.5 : 1.8}
                      className={cn(
                        "transition-all duration-200",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] font-medium mt-0.5 transition-all",
                      active ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                    {active && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </DashboardProvider>
  );
};

export default SellerDashboardLayout;

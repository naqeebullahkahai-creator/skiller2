import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Menu,
  X,
  ChevronLeft,
  Store,
  LogOut,
  User,
  Bell,
  Search,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileSellerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const { sellerProfile, isVerified, isPending, isRejected } = useSellerKyc();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Bottom navigation for mobile
  const bottomNavItems = [
    { icon: Home, label: "Home", href: "/seller-center" },
    { icon: Package, label: "Products", href: "/seller-center/products" },
    { icon: ShoppingCart, label: "Orders", href: "/seller-center/orders" },
    { icon: Wallet, label: "Wallet", href: "/seller-center/wallet" },
  ];

  // Sidebar links
  const sidebarLinks = [
    { name: "Dashboard", href: "/seller-center", icon: Home },
    { name: "My Products", href: "/seller-center/products", icon: Package },
    { name: "Orders", href: "/seller-center/orders", icon: ShoppingCart },
    { name: "Wallet", href: "/seller-center/wallet", icon: Wallet },
    { name: "Flash Sale", href: "/seller-center/flash-sale", icon: Package },
    { name: "Analytics", href: "/seller-center/analytics", icon: Package },
    { name: "Vouchers", href: "/seller-center/vouchers", icon: Package },
    { name: "Messages", href: "/seller-center/messages", icon: Package },
    { name: "Reviews", href: "/seller-center/reviews", icon: Package },
    { name: "Returns", href: "/seller-center/returns", icon: Package },
    { name: "KYC", href: "/seller-center/kyc", icon: Package },
    { name: "Settings", href: "/seller-center/settings", icon: Settings },
  ];

  const getVerificationBadge = () => {
    if (isVerified) {
      return <Badge className="bg-emerald-500 text-white text-xs">Verified</Badge>;
    }
    if (isPending) {
      return <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>;
    }
    if (isRejected) {
      return <Badge className="bg-red-500 text-white text-xs">Rejected</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Not Verified</Badge>;
  };

  const isActive = (href: string) => {
    if (href === "/seller-center") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-background border-b safe-area-top">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="touch-target">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex flex-col h-full">
                    {/* Sheet Header */}
                    <div className="p-4 border-b bg-primary text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white/20">
                          <AvatarImage src={profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {profile?.full_name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{profile?.full_name || "Seller"}</p>
                          {getVerificationBadge()}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-3">
                      {sidebarLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setSheetOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
                            isActive(link.href)
                              ? "bg-primary text-white"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.name}
                        </Link>
                      ))}
                    </nav>

                    {/* Sheet Footer */}
                    <div className="p-3 border-t">
                      <Link
                        to="/"
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                      >
                        <Store className="w-5 h-5" />
                        Back to Store
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="font-bold text-primary">Seller Center</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="touch-target">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-white text-xs">
                  {profile?.full_name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t safe-area-bottom">
          <div className="grid grid-cols-4 h-16">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link to="/seller-center" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Store size={18} className="text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-white">Seller Center</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary text-white">
                  {profile?.full_name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                {getVerificationBadge()}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <link.icon size={20} />
                  {sidebarOpen && <span>{link.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Back to Store */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Store size={20} />
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Desktop Header */}
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-background border-b transition-all duration-300",
          sidebarOpen ? "left-64" : "left-16"
        )}
      >
        <div className="flex items-center justify-between h-full px-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Store className="h-4 w-4 mr-2" />
              Buyer View
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {profile?.full_name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">{profile?.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/account/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/seller-center/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MobileSellerLayout;

import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  ShoppingCart, 
  Settings, 
  Menu,
  ChevronLeft,
  Store,
  LogOut,
  User,
  Bell,
  Search,
  Package,
  Image,
  Zap,
  Shield,
  BarChart3,
  Wallet,
  Tags,
  MessageSquare,
  RotateCcw,
  Star,
  FileCheck
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  // Bottom navigation for mobile
  const bottomNavItems = [
    { icon: Home, label: "Home", href: "/admin-dashboard" },
    { icon: ShoppingCart, label: "Orders", href: "/admin-dashboard/orders" },
    { icon: Users, label: "Users", href: "/admin-dashboard/users" },
    { icon: Settings, label: "Settings", href: "/admin-dashboard/settings" },
  ];

  // Sidebar links
  const sidebarLinks = [
    { name: "Dashboard", href: "/admin-dashboard", icon: Home },
    { name: "Orders", href: "/admin-dashboard/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin-dashboard/products", icon: Package },
    { name: "Categories", href: "/admin-dashboard/categories", icon: Tags },
    { name: "Users", href: "/admin-dashboard/users", icon: Users },
    { name: "Seller KYC", href: "/admin-dashboard/seller-kyc", icon: FileCheck },
    { name: "Banners", href: "/admin-dashboard/banners", icon: Image },
    { name: "Flash Sales", href: "/admin-dashboard/flash-sales", icon: Zap },
    { name: "Payouts", href: "/admin-dashboard/payouts", icon: Wallet },
    { name: "Vouchers", href: "/admin-dashboard/vouchers", icon: Tags },
    { name: "Reviews", href: "/admin-dashboard/reviews", icon: Star },
    { name: "Q&A", href: "/admin-dashboard/qa", icon: MessageSquare },
    { name: "Returns", href: "/admin-dashboard/returns", icon: RotateCcw },
    { name: "Cancellations", href: "/admin-dashboard/cancellations", icon: FileCheck },
    { name: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart3 },
    { name: "Roles", href: "/admin-dashboard/roles", icon: Shield },
    { name: "Settings", href: "/admin-dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin-dashboard") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <PermissionsProvider>
        <DashboardProvider>
          <div className="min-h-screen bg-muted/30 pb-20">
            {/* Mobile Header */}
            <header className="sticky top-0 z-40 bg-slate-900 text-white safe-area-top">
              <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center gap-3">
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="touch-target text-white hover:bg-white/10">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-800">
                      <div className="flex flex-col h-full">
                        {/* Sheet Header */}
                        <div className="p-4 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary">
                              <AvatarImage src={profile?.avatar_url || ""} />
                              <AvatarFallback className="bg-primary text-white">
                                {profile?.full_name?.charAt(0) || "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white">{profile?.full_name || "Admin"}</p>
                              <Badge className="bg-primary text-white text-xs">Super Admin</Badge>
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
                                  : "text-slate-300 hover:bg-slate-800"
                              )}
                            >
                              <link.icon className="w-5 h-5" />
                              {link.name}
                            </Link>
                          ))}
                        </nav>

                        {/* Sheet Footer */}
                        <div className="p-3 border-t border-slate-800">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full"
                          >
                            <LogOut className="w-5 h-5" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <span className="font-bold">Admin Panel</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="touch-target text-white hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {profile?.full_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Main Content */}
          <main className="p-4 overflow-x-hidden">
              <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 safe-area-bottom">
              <div className="grid grid-cols-4 h-16">
                {bottomNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-colors",
                      isActive(item.href)
                        ? "text-primary"
                        : "text-slate-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </DashboardProvider>
      </PermissionsProvider>
    );
  }

  // Desktop Layout
  return (
    <PermissionsProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-muted/30">
          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 h-screen bg-slate-900 transition-all duration-300 flex flex-col",
              sidebarOpen ? "w-64" : "w-16"
            )}
          >
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
              <Link to="/admin-dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                {sidebarOpen && (
                  <span className="text-lg font-bold text-white">Admin</span>
                )}
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* User Info */}
            {sidebarOpen && (
              <div className="px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-white">
                      {profile?.full_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                    <Badge className="bg-primary text-white text-xs">Super Admin</Badge>
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
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <link.icon size={20} />
                      {sidebarOpen && <span>{link.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
              >
                <LogOut size={20} />
                {sidebarOpen && <span>Logout</span>}
              </button>
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
              <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {profile?.full_name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm">{profile?.full_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/admin-dashboard/settings")}>
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
            <div className="p-4 md:p-6 overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </DashboardProvider>
    </PermissionsProvider>
  );
};

export default MobileAdminLayout;

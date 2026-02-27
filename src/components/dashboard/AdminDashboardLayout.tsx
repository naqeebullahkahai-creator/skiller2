import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  Home,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
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
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import DynamicAdminSidebar from "@/components/admin/DynamicAdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
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

  const bottomNavItems = [
    { icon: Home, label: "Home", href: "/admin/dashboard" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const isBottomActive = (href: string) => {
    if (href === "/admin/dashboard") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-muted">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-[hsl(var(--dashboard-sidebar))] safe-area-top">
          <div className="flex items-center justify-between h-14 px-3">
            <div className="flex items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="text-white/90 p-1.5 active:scale-95 transition-transform">
                    <Menu size={22} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-[hsl(var(--dashboard-sidebar))] border-[hsl(var(--dashboard-sidebar-border))] flex flex-col h-full">
                  <div className="p-4 bg-primary/15 shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-white/15">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-primary/30 text-white font-semibold">
                          {profile?.full_name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{profile?.full_name || "Admin"}</p>
                        <Badge className="bg-primary/20 text-primary-foreground text-xs border-0 mt-1">
                          Super Admin
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <DynamicAdminSidebar sidebarOpen={true} onNavigate={() => setMobileMenuOpen(false)} />
                  </div>
                  <div className="p-3 border-t border-[hsl(var(--dashboard-sidebar-border))] shrink-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 w-full active:scale-[0.97] transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="text-white font-bold text-lg">Admin Panel</span>
            </div>

            <div className="flex items-center gap-1">
              <button className="text-white/80 p-2 active:scale-95 transition-transform rounded-full hover:bg-white/10">
                <Bell size={20} />
              </button>
              <Avatar className="h-8 w-8 border-2 border-white/15">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-primary/30 text-white text-xs font-semibold">
                  {profile?.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Desktop Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-[hsl(var(--dashboard-sidebar))] text-white transition-all duration-300 hidden md:flex md:flex-col",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b border-[hsl(var(--dashboard-sidebar-border))]">
            {sidebarOpen && (
              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">FANZON</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          </div>

          <div className="p-4 border-b border-[hsl(var(--dashboard-sidebar-border))]">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
              {sidebarOpen ? "Admin Panel" : "A"}
            </Badge>
          </div>

          <DynamicAdminSidebar sidebarOpen={sidebarOpen} />

          <div className="p-4 border-t border-[hsl(var(--dashboard-sidebar-border))]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          "md:ml-64",
          !sidebarOpen && "md:ml-20"
        )}>
          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-30 h-16 bg-card/98 backdrop-blur-xl border-b border-border/50 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64 bg-secondary/60 border-border/50" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell size={20} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover aspect-square" />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm">{profile?.full_name || "Admin"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover">
                  <DropdownMenuItem asChild><Link to="/admin/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-3 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
            <DashboardProvider>
              <Outlet />
            </DashboardProvider>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
          <div className="bg-[hsl(var(--dashboard-sidebar))]/95 backdrop-blur-xl border-t border-[hsl(var(--dashboard-sidebar-border))]/50">
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
                        active ? "text-primary" : "text-[hsl(var(--dashboard-sidebar-text))]"
                      )}
                    />
                    <span className={cn(
                      "text-[10px] font-medium mt-0.5 transition-all",
                      active ? "text-primary font-semibold" : "text-[hsl(var(--dashboard-sidebar-text))]"
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
    </PermissionsProvider>
  );
};

export default AdminDashboardLayout;

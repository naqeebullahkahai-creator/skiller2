import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Store,
  Eye,
  Menu,
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
import { useViewMode } from "@/contexts/ViewModeContext";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import DynamicAdminSidebar from "@/components/admin/DynamicAdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { enableCustomerView } = useViewMode();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleBuyerView = () => {
    enableCustomerView();
    navigate("/");
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-muted">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-700">
              <div className="flex h-14 items-center px-4 border-b border-slate-700">
                <span className="text-xl font-bold text-primary">FANZON</span>
              </div>
              <div className="p-4 border-b border-slate-700">
                <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Admin Panel
                </Badge>
              </div>
              <DynamicAdminSidebar sidebarOpen={true} onNavigate={() => setMobileMenuOpen(false)} />
              <div className="p-4 border-t border-slate-700">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Store size={20} />
                  <span>Back to Store</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          
          <span className="text-lg font-bold text-primary">Admin Panel</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover aspect-square" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.full_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={handleBuyerView}>
                <Eye size={16} className="mr-2" />View as Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut size={16} className="mr-2" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Desktop Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 hidden md:flex md:flex-col",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
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

          <div className="p-4 border-b border-slate-700">
            <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {sidebarOpen ? "Admin Panel" : "A"}
            </Badge>
          </div>

          <DynamicAdminSidebar sidebarOpen={sidebarOpen} />

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
          "flex-1 transition-all duration-300 min-h-screen",
          "md:ml-64",
          !sidebarOpen && "md:ml-20"
        )}>
          {/* Desktop Header */}
          <header className="hidden md:flex sticky top-0 z-30 h-16 bg-background border-b items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleBuyerView} className="items-center gap-2">
                <Eye size={16} /><span>Buyer View</span>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
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
                    <span className="hidden md:inline">{profile?.full_name || "Admin"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover">
                  <DropdownMenuItem asChild><Link to="/account/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/admin/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBuyerView}>
                    <Eye size={16} className="mr-2" />Switch to Buyer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-4 md:p-6 pb-20 md:pb-6">
            <DashboardProvider>
              <Outlet />
            </DashboardProvider>
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
};

export default AdminDashboardLayout;

import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Store,
  Eye
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
import { DashboardProvider } from "@/contexts/DashboardContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import DynamicAdminSidebar from "@/components/admin/DynamicAdminSidebar";

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const handleBuyerView = () => {
    navigate("/");
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-muted flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col",
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

          {/* Role Badge */}
          <div className="p-4 border-b border-slate-700">
            <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {sidebarOpen ? "Admin Panel" : "A"}
            </Badge>
          </div>

          {/* Dynamic Navigation based on permissions */}
          <DynamicAdminSidebar sidebarOpen={sidebarOpen} />

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
                placeholder="Search..."
                className="pl-9 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch to Buyer View */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBuyerView}
              className="hidden sm:flex items-center gap-2"
            >
              <Eye size={16} />
              <span>Buyer View</span>
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    {profile?.avatar_url ? (
                      <AvatarImage 
                        src={profile.avatar_url} 
                        alt={profile.full_name} 
                        className="object-cover aspect-square"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{profile?.full_name || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin-dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBuyerView}>
                  <Eye size={16} className="mr-2" />
                  Switch to Buyer
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

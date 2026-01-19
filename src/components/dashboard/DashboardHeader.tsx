import { Bell, Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";

const DashboardHeader = () => {
  const { role, setRole, sidebarOpen, setSidebarOpen } = useDashboard();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 transition-all duration-300",
        sidebarOpen ? "left-64" : "left-16"
      )}
    >
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-64 pl-9 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Right: Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <Label
            htmlFor="role-switch"
            className={cn(
              "text-xs font-medium cursor-pointer transition-colors",
              role === "seller" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Seller
          </Label>
          <Switch
            id="role-switch"
            checked={role === "admin"}
            onCheckedChange={(checked) => setRole(checked ? "admin" : "seller")}
            className="data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor="role-switch"
            className={cn(
              "text-xs font-medium cursor-pointer transition-colors",
              role === "admin" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Admin
          </Label>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <span className="hidden md:block text-sm font-medium">
                {role === "admin" ? "Admin User" : "TechZone Store"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>My Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="sm:hidden px-2 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {role === "admin" ? "Admin Mode" : "Seller Mode"}
                </span>
                <Switch
                  checked={role === "admin"}
                  onCheckedChange={(checked) => setRole(checked ? "admin" : "seller")}
                  className="scale-75"
                />
              </div>
            </div>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;

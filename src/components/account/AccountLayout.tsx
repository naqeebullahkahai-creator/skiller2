import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Bell,
  Settings,
  HelpCircle,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useMessaging";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { icon: User, label: "Profile Info", path: "/account/profile" },
  { icon: Package, label: "My Orders", path: "/account/orders" },
  { icon: MessageSquare, label: "Messages", path: "/account/messages" },
  { icon: Heart, label: "My Wishlist", path: "/account/wishlist" },
  { icon: MapPin, label: "Saved Addresses", path: "/account/addresses" },
  { icon: Bell, label: "Notifications", path: "/account/notifications" },
  { icon: HelpCircle, label: "Help Center", path: "/help" },
];

const AccountLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout, isLoading } = useAuth();
  const { unreadCount } = useUnreadCount();
  const isMobile = useIsMobile();

  if (!isLoading && !user) {
    navigate("/auth?redirect=/account/profile");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  // Mobile: Show menu grid on /account root, show content on sub-pages
  const isAccountRoot = location.pathname === "/account" || location.pathname === "/account/";
  const showMobileMenu = isMobile && isAccountRoot;
  const showMobileContent = isMobile && !isAccountRoot;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MobileHeader />

        {showMobileMenu ? (
          <main className="flex-1 pb-24">
            {/* Profile Card */}
            <div className="bg-primary p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary-foreground/30">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-primary-foreground text-lg truncate">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-sm text-primary-foreground/70 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items - Native App Style */}
            <div className="px-3 py-3 space-y-1">
              {menuItems.map((item) => {
                const isMessagesItem = item.path === "/account/messages";
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-4 px-4 py-4 bg-card rounded-xl border border-border active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                    {isMessagesItem && unreadCount > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </button>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-4 bg-card rounded-xl border border-border active:scale-[0.98] transition-all mt-4"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <LogOut size={20} className="text-destructive" />
                </div>
                <span className="flex-1 text-left font-medium text-destructive">Logout</span>
              </button>
            </div>
          </main>
        ) : (
          <main className="flex-1 pb-24">
            {/* Back Header */}
            <div className="sticky top-[calc(var(--mobile-header-height,104px))] z-30 bg-background border-b px-3 py-2.5">
              <button
                onClick={() => navigate("/account")}
                className="flex items-center gap-2 text-foreground active:scale-[0.97] transition-transform"
              >
                <ChevronLeft size={20} />
                <span className="font-medium">Back</span>
              </button>
            </div>
            <div className="p-3">
              <Outlet />
            </div>
          </main>
        )}

        <MobileBottomNav />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isMessagesItem = item.path === "/account/messages";
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )
                      }
                    >
                      <item.icon size={20} />
                      <span className="flex-1">{item.label}</span>
                      {isMessagesItem && unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                      <ChevronRight size={16} />
                    </NavLink>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut size={20} className="mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default AccountLayout;

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Headphones, MessageSquare, DollarSign, BarChart3, Settings, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const sidebarLinks = [
  { icon: Home, label: "Dashboard", path: "/agent/dashboard" },
  { icon: MessageSquare, label: "Chats", path: "/agent/chats" },
  { icon: DollarSign, label: "Earnings", path: "/agent/earnings" },
  { icon: BarChart3, label: "Performance", path: "/agent/performance" },
  { icon: Settings, label: "Settings", path: "/agent/settings" },
];

const AgentDashboardLayout = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === "/agent/dashboard") return location.pathname === "/agent/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <ProtectedRoute allowedRoles={["support_agent"]}>
      <div className="min-h-screen bg-muted/30">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="fixed left-0 top-0 h-full w-56 bg-card border-r border-border z-40 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-bold text-sm">Agent Panel</h2>
                  <p className="text-[10px] text-muted-foreground truncate">{profile?.full_name || "Agent"}</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-2 space-y-1">
              {sidebarLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
            <Headphones className="h-5 w-5 text-primary" />
            <h1 className="text-sm font-bold">Agent Panel</h1>
          </header>
        )}

        {/* Main Content */}
        <main className={cn("min-h-screen transition-all", !isMobile ? "ml-56" : "")}>
          <div className="p-4 md:p-6 pb-24">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
            <div className="bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-around h-14">
                {sidebarLinks.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="flex flex-col items-center justify-center flex-1 h-full active:scale-[0.92] transition-all duration-150"
                    >
                      <item.icon
                        size={20}
                        strokeWidth={active ? 2.5 : 1.8}
                        className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground")}
                      />
                      <span className={cn("text-[10px] font-medium mt-0.5", active ? "text-primary font-semibold" : "text-muted-foreground")}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AgentDashboardLayout;

import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Menu, ArrowLeft, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ModuleNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface AdminModuleLayoutProps {
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  backHref: string;
  navItems: ModuleNavItem[];
  children?: React.ReactNode;
}

const CountBadge = ({ count }: { count: number }) => {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 shrink-0">
      {count > 99 ? "99+" : count}
    </span>
  );
};

// Detail dialog context for inline viewing
import { createContext, useContext, ReactNode } from "react";

interface DetailDialogContextType {
  openDetail: (title: string, content: ReactNode) => void;
  closeDetail: () => void;
}

const DetailDialogContext = createContext<DetailDialogContextType>({
  openDetail: () => {},
  closeDetail: () => {},
});

export const useDetailDialog = () => useContext(DetailDialogContext);

const AdminModuleLayout = ({ title, icon: Icon, color, backHref, navItems }: AdminModuleLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailContent, setDetailContent] = useState<ReactNode>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const openDetail = (t: string, content: ReactNode) => {
    setDetailTitle(t);
    setDetailContent(content);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailContent(null);
  };

  const isActive = (href: string) => {
    const current = location.pathname.replace(/^\/admin-app/, "/admin");
    const target = href.replace(/^\/admin-app/, "/admin");
    return current === target || current.startsWith(target + "/");
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Module Header */}
      <div className={cn("p-4 border-b border-border/10", color)}>
        <div className="flex items-center gap-3">
          <Icon size={24} className="text-white shrink-0" />
          <div>
            <h2 className="font-bold text-white text-lg">{title}</h2>
            <p className="text-white/60 text-xs">Management Module</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-[hsl(var(--dashboard-sidebar-text))] hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge ? <CountBadge count={item.badge} /> : null}
            </Link>
          );
        })}
      </nav>

      {/* Back to Admin */}
      <div className="p-3 border-t border-[hsl(var(--dashboard-sidebar-border))]">
        <Link
          to={backHref}
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[hsl(var(--dashboard-sidebar-text))]/70 hover:bg-[hsl(var(--dashboard-sidebar-hover))] hover:text-white transition-colors w-full text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back to Admin</span>
        </Link>
      </div>
    </div>
  );

  // Mobile: tab-based nav at bottom
  if (isMobile) {
    return (
      <DetailDialogContext.Provider value={{ openDetail, closeDetail }}>
        <div className="min-h-screen bg-background pb-16">
          {/* Mobile Header */}
          <div className={cn("sticky top-0 z-50 px-4 py-3", color)}>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(backHref)} className="text-white active:scale-95 p-1">
                <ArrowLeft size={20} />
              </button>
              <Icon size={20} className="text-white" />
              <h1 className="font-bold text-white text-base flex-1">{title}</h1>
            </div>
          </div>

          {/* Scrollable Nav Tabs */}
          <div className="sticky top-[52px] z-40 bg-card border-b border-border">
            <div className="flex overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap text-xs font-medium border-b-2 transition-colors shrink-0",
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon size={14} />
                    <span>{item.name}</span>
                    {item.badge ? (
                      <span className="min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-1">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="p-3">
            <Outlet />
          </main>

          {/* Detail Dialog for inline viewing */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{detailTitle}</DialogTitle>
              </DialogHeader>
              {detailContent}
            </DialogContent>
          </Dialog>
        </div>
      </DetailDialogContext.Provider>
    );
  }

  // Desktop layout
  return (
    <DetailDialogContext.Provider value={{ openDetail, closeDetail }}>
      <div className="min-h-screen bg-muted flex">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-[hsl(var(--dashboard-sidebar))] text-white transition-all duration-300 hidden md:flex md:flex-col",
            sidebarOpen ? "w-60" : "w-0 overflow-hidden"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Main Area */}
        <div className={cn("flex-1 min-h-screen transition-all duration-300", sidebarOpen ? "md:ml-60" : "md:ml-0")}>
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-card/98 backdrop-blur-xl border-b border-border/50">
            <div className="flex items-center h-14 px-3 md:px-6 gap-3">
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex text-muted-foreground hover:text-foreground p-1.5"
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>

              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", color)}>
                  <Icon size={16} className="text-white" />
                </div>
                <h1 className="font-semibold text-foreground text-sm md:text-base">{title}</h1>
              </div>

              <div className="ml-auto">
                <Link
                  to={backHref}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              </div>
            </div>
          </header>

          <main className="p-3 md:p-6 pb-6">
            <Outlet />
          </main>
        </div>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detailTitle}</DialogTitle>
            </DialogHeader>
            {detailContent}
          </DialogContent>
        </Dialog>
      </div>
    </DetailDialogContext.Provider>
  );
};

export default AdminModuleLayout;

import { useState } from "react";
import { Menu, Bell, Search, Wallet, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Settings, HelpCircle, Globe, Store } from "lucide-react";
import MobileSearchOverlay from "@/components/mobile/MobileSearchOverlay";
import QRCodeScanner from "@/components/shared/QRCodeScanner";
import { useCustomerWallet } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";

const MobileHeader = () => {
  const { isAuthenticated, role } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const { wallet } = useCustomerWallet();

  const sidebarLinks = [
    { icon: Store, label: "Become a Partner", path: "/business/signup" },
    { icon: HelpCircle, label: t("nav.help"), path: "/help" },
    { icon: Settings, label: t("nav.settings"), path: "/account/profile" },
  ];

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-primary safe-area-top">
        {/* Main Row */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-primary-foreground p-1 active:scale-95 transition-transform">
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-[280px] p-0">
              <SheetHeader className="bg-primary p-4 text-left">
                <SheetTitle className="text-primary-foreground text-xl">FANZON</SheetTitle>
              </SheetHeader>
              <nav className="p-4 space-y-1">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                  >
                    <link.icon size={20} className="text-muted-foreground" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
                <div className="pt-4 border-t border-border mt-4">
                  <div className="flex items-center gap-3 p-3 text-muted-foreground">
                    <Globe size={20} />
                    <span className="font-medium">{t("nav.language")}</span>
                  </div>
                  <LanguageSwitcher variant="sidebar" className="ps-4" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="text-primary-foreground font-bold text-lg">
            FANZON
          </Link>

          <div className="flex-1" />

          {/* QR Scanner */}
          <QRCodeScanner className="text-primary-foreground" />

          {/* Wallet Balance */}
          {isAuthenticated && role === "customer" && (
            <Link
              to="/account/wallet"
              className="flex items-center gap-1 px-2 py-1 bg-primary-foreground/15 rounded-full text-primary-foreground active:scale-95 transition-transform"
            >
              <Wallet size={14} />
              <span className="text-xs font-bold">{formatPKR(wallet?.balance || 0)}</span>
            </Link>
          )}

          {/* Notification */}
          {isAuthenticated && <NotificationBell />}
        </div>

        {/* Search Pill */}
        <div className="px-3 pb-2.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 h-9 px-4 bg-white/95 rounded-full text-muted-foreground text-sm active:scale-[0.98] transition-transform"
          >
            <Search size={16} />
            <span>{t("search.placeholder")}</span>
          </button>
        </div>
      </header>

      <MobileSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default MobileHeader;

import { useState } from "react";
import { Search, Menu, X, Settings, HelpCircle, Globe, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MobileHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const sidebarLinks = [
    { icon: Store, label: "Become a Partner", path: "/business/signup" },
    { icon: HelpCircle, label: t("nav.help"), path: "/help" },
    { icon: Settings, label: t("nav.settings"), path: "/account/profile" },
  ];

  return (
    <header className="md:hidden sticky top-0 z-50 bg-primary safe-area-top">
      {/* Main Header Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Sidebar Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-primary-foreground p-1 active:scale-95 transition-transform">
              <Menu size={24} />
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
              
              {/* Language Switcher Section */}
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
        <Link to="/" className="text-primary-foreground font-bold text-xl">
          FANZON
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notification Bell */}
        {isAuthenticated && <NotificationBell />}
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "w-full ps-10 pe-4 h-10 bg-white border-0 rounded-lg transition-shadow",
              isSearchFocused && "ring-2 ring-white/50"
            )}
          />
          <Search
            size={18}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground p-1",
                isRTL ? "left-3" : "right-3"
              )}
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};

export default MobileHeader;

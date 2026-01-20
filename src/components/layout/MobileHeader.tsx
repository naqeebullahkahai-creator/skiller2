import { useState } from "react";
import { Search, Menu, X, Settings, HelpCircle, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MobileHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    { icon: HelpCircle, label: "Help Center", path: "/help" },
    { icon: Settings, label: "Settings", path: "/account/profile" },
    { icon: Globe, label: "Language", path: "#", onClick: () => {} },
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
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="bg-primary p-4 text-left">
              <SheetTitle className="text-primary-foreground text-xl">FANZON</SheetTitle>
            </SheetHeader>
            <nav className="p-4 space-y-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={link.onClick}
                  className="flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <link.icon size={20} className="text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
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
            placeholder="Search in FANZON..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              "w-full pl-10 pr-4 h-10 bg-white border-0 rounded-lg transition-shadow",
              isSearchFocused && "ring-2 ring-white/50"
            )}
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
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

import { Search, ChevronDown, Menu, X, MessageCircle, Wallet, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMainCategories } from "@/hooks/useCategories";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CartDrawer from "@/components/cart/CartDrawer";
import NotificationBell from "@/components/notifications/NotificationBell";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import AnimatedProfileMenu from "@/components/navigation/AnimatedProfileMenu";
import CategoryAccordion from "@/components/navigation/CategoryAccordion";
import FanzonLogo from "@/components/brand/FanzonLogo";
import VoiceSearchButton from "@/components/shared/VoiceSearchButton";
import { useUnreadCount } from "@/hooks/useMessaging";
import { useCustomerWallet } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";

const MainHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { t, isRTL } = useLanguage();
  const { data: categories } = useMainCategories();
  const { unreadCount } = useUnreadCount();
  const { wallet } = useCustomerWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t("nav.all_categories"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto">
        {/* Main Row */}
        <div className="flex items-center h-[60px] gap-3">
          {/* Mobile Menu */}
          <button
            className="md:hidden text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <FanzonLogo size="md" />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="flex w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 h-10 text-xs text-muted-foreground bg-secondary border border-border border-r-0 rounded-l-lg whitespace-nowrap hover:bg-muted transition-colors">
                    {selectedCategory}
                    <ChevronDown size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedCategory(t("nav.all_categories"))}>
                    {t("nav.all_categories")}
                  </DropdownMenuItem>
                  {categories?.map((category) => (
                    <DropdownMenuItem key={category.id} onClick={() => setSelectedCategory(category.name)}>
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1 h-10 border border-border border-x-0 bg-secondary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
              <VoiceSearchButton
                onResult={(text) => {
                  setSearchQuery(text);
                  navigate(`/search?q=${encodeURIComponent(text)}`);
                }}
                size={16}
              />
              <Button type="submit" className="h-10 rounded-none rounded-r-lg px-5">
                <Search size={18} />
              </Button>
            </form>
            <SearchSuggestions
              query={searchQuery}
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
              onSelect={(value) => {
                setSearchQuery(value);
                navigate(`/search?q=${encodeURIComponent(value)}`);
              }}
              inputRef={searchInputRef}
            />
          </div>

          {/* Right Actions — Daraz-style icon columns */}
          <div className="flex items-center gap-0.5 ml-auto">
            {/* Wallet */}
            {isAuthenticated && role === "customer" && (
              <Link
                to="/account/wallet"
                className="hidden md:flex flex-col items-center px-3 py-1 hover:bg-primary/10 rounded-lg transition-colors group"
              >
                <Wallet size={20} className="text-foreground group-hover:text-primary" />
                <span className="text-[11px] font-semibold text-primary">{formatPKR(wallet?.balance || 0)}</span>
              </Link>
            )}

            {/* Messages */}
            {isAuthenticated && (
              <Link
                to="/account/messages"
                className="hidden md:flex flex-col items-center px-3 py-1 hover:bg-primary/10 rounded-lg transition-colors group relative"
              >
                <MessageCircle size={20} className="text-foreground group-hover:text-primary" />
                <span className="text-[11px] text-muted-foreground group-hover:text-primary">Messages</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-1 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* Profile / Login-SignUp */}
            <AnimatedProfileMenu />

            {/* Cart */}
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3 px-1">
          <form onSubmit={handleSearch} className="flex w-full bg-secondary rounded-lg overflow-hidden border border-border">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-none px-4">
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-card border-t border-border overflow-hidden transition-all duration-300 ease-out ${isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="container mx-auto py-4 max-h-[70vh] overflow-y-auto">
          <CategoryAccordion onCategoryClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;

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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto">
        {/* Main Row */}
        <div className="flex items-center h-16 gap-4">
          {/* Mobile Menu */}
          <button
            className="md:hidden text-foreground p-2 hover:bg-muted rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <FanzonLogo size="md" />
          </Link>

          {/* Search Bar — Floating pill style */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="flex w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 h-11 text-xs font-medium text-muted-foreground bg-muted/60 border border-border/60 border-r-0 rounded-l-full whitespace-nowrap hover:bg-muted transition-colors">
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
              <div className="flex-1 relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-11 border border-border/60 border-x-0 bg-muted/60 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/60"
                />
              </div>
              <VoiceSearchButton
                onResult={(text) => {
                  setSearchQuery(text);
                  navigate(`/search?q=${encodeURIComponent(text)}`);
                }}
                size={16}
              />
              <Button type="submit" className="h-11 rounded-none rounded-r-full px-6 bg-primary hover:bg-primary/90">
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

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Wallet */}
            {isAuthenticated && role === "customer" && (
              <Link
                to="/account/wallet"
                className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-xl transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet size={16} className="text-primary" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] text-muted-foreground leading-none">Balance</p>
                  <p className="text-xs font-bold text-primary leading-tight">{formatPKR(wallet?.balance || 0)}</p>
                </div>
              </Link>
            )}

            {/* Messages */}
            {isAuthenticated && (
              <Link
                to="/account/messages"
                className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-xl transition-colors group relative"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center relative">
                  <MessageCircle size={16} className="text-foreground group-hover:text-primary transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-accent text-accent-foreground text-[9px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
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
          <form onSubmit={handleSearch} className="flex w-full bg-muted/60 rounded-full overflow-hidden border border-border/50">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-none rounded-r-full px-4">
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

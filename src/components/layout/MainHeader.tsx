import { Search, ChevronDown, Menu, X, MessageCircle, Wallet } from "lucide-react";
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
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import AnimatedProfileMenu from "@/components/navigation/AnimatedProfileMenu";
import CategoryAccordion from "@/components/navigation/CategoryAccordion";
import FanzonLogo from "@/components/brand/FanzonLogo";
import VoiceSearchButton from "@/components/shared/VoiceSearchButton";
import QRCodeScanner from "@/components/shared/QRCodeScanner";
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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-soft">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground p-2 hover:bg-muted rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <FanzonLogo size="md" textClassName="text-foreground" />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="flex w-full bg-secondary rounded-xl overflow-hidden border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:bg-muted border-r border-border whitespace-nowrap transition-colors duration-200">
                    {selectedCategory}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedCategory(t("nav.all_categories"))}>
                    {t("nav.all_categories")}
                  </DropdownMenuItem>
                  {categories?.map((category) => (
                    <DropdownMenuItem 
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                    >
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
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />
              <VoiceSearchButton
                onResult={(text) => {
                  setSearchQuery(text);
                  navigate(`/search?q=${encodeURIComponent(text)}`);
                }}
                size={18}
              />
              <Button 
                type="submit"
                className="rounded-none px-6 bg-primary hover:bg-primary/90 transition-colors duration-200"
              >
                <Search size={18} />
              </Button>
            </form>
            <div className="flex items-center ml-2">
              <QRCodeScanner className="text-muted-foreground hover:text-primary hover:bg-muted rounded-xl" />
            </div>
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
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Wallet Balance - Desktop */}
            {isAuthenticated && role === "customer" && (
              <Link
                to="/account/wallet"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-xl text-primary font-semibold transition-colors"
                title="Wallet"
              >
                <Wallet size={16} />
                <span className="text-sm">{formatPKR(wallet?.balance || 0)}</span>
              </Link>
            )}

            {/* Language Switcher - Desktop */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="header" />
            </div>
            
            {/* Messages Icon - Desktop */}
            {isAuthenticated && (
              <Link 
                to="/account/messages" 
                className="hidden md:flex relative p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-colors"
                title="Messages"
              >
                <MessageCircle size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold rounded-full px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}
            
            {/* Animated Profile Menu - Desktop */}
            <AnimatedProfileMenu />

            {/* Cart */}
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 px-1">
          <form onSubmit={handleSearch} className="flex w-full bg-secondary rounded-xl overflow-hidden border border-border">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-none px-4 hover:bg-primary/90 transition-colors duration-200">
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-card border-t border-border overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container mx-auto py-4 max-h-[70vh] overflow-y-auto">
          <CategoryAccordion onCategoryClick={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;

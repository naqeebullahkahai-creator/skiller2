import { Search, User, ChevronDown, Menu, X, LogOut, LayoutDashboard, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { navCategories } from "@/data/mockData";
import { useAuth, SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CartDrawer from "@/components/cart/CartDrawer";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import SearchSuggestions from "@/components/search/SearchSuggestions";

const MainHeader = () => {
  const navigate = useNavigate();
  const { user, profile, role, isAuthenticated, isSuperAdmin, logout, setShowAuthModal, setAuthModalMode } = useAuth();
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(t("nav.all_categories"));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    // Only super admin can access admin dashboard
    if (role === "admin" && isSuperAdmin) return "/admin-dashboard";
    if (role === "seller") return "/seller-center";
    return null;
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-14 md:h-16 gap-4">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground tracking-tight">
              FANZON
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="flex w-full bg-card rounded overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:bg-muted border-r border-border whitespace-nowrap">
                    {selectedCategory}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedCategory(t("nav.all_categories"))}>
                    {t("nav.all_categories")}
                  </DropdownMenuItem>
                  {navCategories.map((category) => (
                    <DropdownMenuItem 
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
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
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />
              <Button 
                type="submit"
                className="rounded-none px-6 bg-fanzon-orange-hover hover:bg-fanzon-dark"
              >
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
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher - Desktop */}
            <div className="hidden md:block">
              <LanguageSwitcher variant="header" />
            </div>
            
            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}
            
            {/* Login/Signup or User Menu - Desktop */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                  >
                    <User size={18} />
                    <span>{displayName}</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                    <Package size={16} className="me-2" />
                    {t("auth.my_orders")}
                  </DropdownMenuItem>
                  {getDashboardLink() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(getDashboardLink()!)}>
                        <LayoutDashboard size={16} className="me-2" />
                        {role === "admin" ? t("auth.admin_dashboard") : t("auth.seller_center")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="me-2" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                onClick={openLoginModal}
              >
                <User size={18} />
                <span>{t("auth.login_signup")}</span>
              </Button>
            )}

            {/* Cart */}
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 px-2">
          <form onSubmit={handleSearch} className="flex w-full bg-card rounded overflow-hidden">
            <Input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="submit" className="rounded-none px-4 bg-fanzon-orange-hover hover:bg-fanzon-dark">
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto py-4">
            <div className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-foreground">
                    {t("common.hello")}, {displayName}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2 text-foreground"
                    onClick={() => { navigate("/orders"); setIsMobileMenuOpen(false); }}
                  >
                    {t("auth.my_orders")}
                  </Button>
                  {getDashboardLink() && (
                    <Button 
                      variant="ghost" 
                      className="justify-start gap-2 text-foreground"
                      onClick={() => { navigate(getDashboardLink()!); setIsMobileMenuOpen(false); }}
                    >
                      <LayoutDashboard size={18} />
                      {role === "admin" ? t("auth.admin_dashboard") : t("auth.seller_center")}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2 text-destructive"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  >
                    <LogOut size={18} />
                    {t("auth.logout")}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2 text-foreground"
                  onClick={() => { openLoginModal(); setIsMobileMenuOpen(false); }}
                >
                  <User size={18} />
                  {t("auth.login_signup")}
                </Button>
              )}
              <div className="border-t border-border my-2" />
              {navCategories.map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="py-2 px-4 hover:bg-muted rounded text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainHeader;

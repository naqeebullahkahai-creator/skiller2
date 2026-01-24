import { Search, ChevronDown, Menu, X } from "lucide-react";
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

const MainHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const { data: categories } = useMainCategories();
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
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />
              <Button 
                type="submit"
                className="rounded-none px-6 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors duration-200"
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
            
            {/* Animated Profile Menu - Desktop */}
            <AnimatedProfileMenu />

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
            <Button type="submit" className="rounded-none px-4 hover:bg-primary/90 transition-colors duration-200">
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Category Accordion */}
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

import { Search, ShoppingCart, User, ChevronDown, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

const MainHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setShowAuthModal, setAuthModalMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = 3;

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
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full bg-card rounded overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:bg-muted border-r border-border whitespace-nowrap">
                    {selectedCategory}
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedCategory("All Categories")}>
                    All Categories
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
                type="text"
                placeholder="Search in FANZON"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
              />
              <Button 
                className="rounded-none px-6 bg-fanzon-orange-hover hover:bg-fanzon-dark"
              >
                <Search size={18} />
              </Button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Login/Signup or User Menu - Desktop */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                  >
                    <User size={18} />
                    <span>{user?.name}</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>My Account</DropdownMenuItem>
                  <DropdownMenuItem>My Orders</DropdownMenuItem>
                  <DropdownMenuItem>Wishlist</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />
                    Logout
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
                <span>Login / Sign Up</span>
              </Button>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={22} className="text-primary-foreground" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-card text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 px-2">
          <div className="flex w-full bg-card rounded overflow-hidden">
            <Input
              type="text"
              placeholder="Search in FANZON"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button className="rounded-none px-4 bg-fanzon-orange-hover hover:bg-fanzon-dark">
              <Search size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto py-4">
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="justify-start gap-2 text-foreground"
              >
                <User size={18} />
                Login / Sign Up
              </Button>
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

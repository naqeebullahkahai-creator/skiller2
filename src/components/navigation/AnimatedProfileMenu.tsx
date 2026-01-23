import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AnimatedProfileMenu = () => {
  const navigate = useNavigate();
  const { user, profile, logout, setShowAuthModal, setAuthModalMode, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/");
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Account";

  if (!isAuthenticated) {
    return (
      <button
        onClick={openLoginModal}
        className="hidden md:flex items-center gap-2 px-4 py-2 text-primary-foreground hover:bg-primary/80 rounded-lg transition-all duration-300"
      >
        <User size={18} />
        <span className="text-sm font-medium">Login / Signup</span>
      </button>
    );
  }

  return (
    <div className="relative hidden md:block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
          "text-primary-foreground hover:bg-primary/80",
          isOpen && "bg-primary/80"
        )}
      >
        <Avatar className="h-8 w-8 border-2 border-primary-foreground/30">
          <AvatarImage 
            src={profile?.avatar_url || undefined} 
            className="object-cover"
          />
          <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium max-w-[100px] truncate">{displayName}</span>
        <ChevronDown 
          size={14} 
          className={cn(
            "transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Animated Dropdown */}
      <div
        ref={menuRef}
        className={cn(
          "absolute top-full right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden",
          "transform origin-top-right transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        {/* User Info Header */}
        <div className="p-4 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage 
                src={profile?.avatar_url || undefined} 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          <Link
            to="/account/orders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors duration-200 group"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Package size={18} className="text-primary" />
            </div>
            <span className="font-medium">My Orders</span>
          </Link>

          <Link
            to="/account/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors duration-200 group"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Settings size={18} className="text-primary" />
            </div>
            <span className="font-medium">Profile Settings</span>
          </Link>

          <div className="my-2 border-t border-border" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors duration-200 group"
          >
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
              <LogOut size={18} className="text-destructive" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AnimatedProfileMenu;

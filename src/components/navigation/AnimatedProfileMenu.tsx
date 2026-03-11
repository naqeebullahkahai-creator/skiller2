import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Settings, LogOut, ChevronDown, Heart, Wallet, MapPin, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AnimatedProfileMenu = () => {
  const navigate = useNavigate();
  const { user, profile, logout, setShowAuthModal, setAuthModalMode, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Account";

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5">
        {/* Desktop: navigate to full auth page */}
        <Link
          to="/auth/login"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground hover:text-primary hover:bg-muted rounded-xl transition-all cursor-pointer"
        >
          <User size={18} />
          <span>Login</span>
        </Link>
        <Link
          to="/auth/signup"
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <UserPlus size={16} />
          <span>Sign Up</span>
        </Link>
        {/* Mobile: open auth modal */}
        <button
          onClick={() => {
            setAuthModalMode("login");
            setShowAuthModal(true);
          }}
          className="md:hidden flex items-center gap-1.5 px-2 py-1.5 text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <User size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={triggerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer",
          "hover:bg-muted",
          isOpen && "bg-muted"
        )}
      >
        <Avatar className="h-7 w-7 ring-2 ring-primary/20">
          <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden lg:flex items-center gap-1">
          <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{displayName}</span>
          <ChevronDown size={12} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </button>

      <div
        ref={menuRef}
        className={cn(
          "absolute top-full right-0 mt-2 w-56 bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden z-50",
          "transform origin-top-right transition-all duration-250 ease-out",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 bg-gradient-to-br from-primary/5 to-transparent border-b border-border/50">
          <p className="font-bold text-sm text-foreground truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
        </div>

        <nav className="py-1.5 px-1.5">
          {[
            { to: "/account/orders", icon: Package, label: "My Orders" },
            { to: "/account/wishlist", icon: Heart, label: "Wishlist" },
            { to: "/account/wallet", icon: Wallet, label: "Wallet" },
            { to: "/account/addresses", icon: MapPin, label: "Addresses" },
            { to: "/account/profile", icon: Settings, label: "Settings" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <Icon size={16} className="text-muted-foreground" />
              {label}
            </Link>
          ))}
          <div className="my-1.5 border-t border-border/50 mx-2" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AnimatedProfileMenu;

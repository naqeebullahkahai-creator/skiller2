import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Package, Settings, LogOut, ChevronDown, Heart, Wallet, MapPin } from "lucide-react";
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
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => {
            setAuthModalMode("login");
            setShowAuthModal(true);
          }}
          className="flex flex-col items-center px-3 py-1 hover:bg-primary/10 rounded-lg transition-colors group cursor-pointer"
        >
          <User size={22} className="text-foreground group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">Login</span>
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={() => {
            setAuthModalMode("signup");
            setShowAuthModal(true);
          }}
          className="flex flex-col items-center px-3 py-1 hover:bg-primary/10 rounded-lg transition-colors group cursor-pointer"
        >
          <User size={22} className="text-foreground group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">Sign Up</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={triggerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex flex-col items-center px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer",
          "hover:bg-primary/10",
          isOpen && "bg-primary/10"
        )}
      >
        <Avatar className="h-6 w-6 border border-primary/30">
          <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-0.5">
          <span className="text-[11px] font-medium text-muted-foreground max-w-[60px] truncate">{displayName}</span>
          <ChevronDown size={10} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
        </div>
      </button>

      <div
        ref={menuRef}
        className={cn(
          "absolute top-full right-0 mt-1.5 w-52 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50",
          "transform origin-top-right transition-all duration-200 ease-out",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        )}
      >
        <div className="px-3 py-2.5 bg-muted/50 border-b border-border">
          <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
        </div>

        <nav className="py-1">
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
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Icon size={16} className="text-muted-foreground" />
              {label}
            </Link>
          ))}
          <div className="my-1 border-t border-border" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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

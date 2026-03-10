import { Store, LayoutDashboard, Shield, Headphones, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

const TopBar = () => {
  const { isAuthenticated, role, isSuperAdmin } = useAuth();

  return (
    <div className="hidden md:block bg-foreground">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-9 text-[11px] tracking-wide">
          <div className="flex items-center gap-6">
            {isAuthenticated && isSuperAdmin && (
              <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-accent font-semibold hover:text-accent/80 transition-colors">
                <Shield size={11} />
                Admin Panel
              </Link>
            )}
            {isAuthenticated && role === "seller" && (
              <Link to="/seller/dashboard" className="flex items-center gap-1.5 text-accent font-semibold hover:text-accent/80 transition-colors">
                <LayoutDashboard size={11} />
                Seller Dashboard
              </Link>
            )}
            {(!isAuthenticated || role === "customer") && (
              <Link to="/business/signup" className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors font-medium">
                <Store size={11} />
                Sell on FANZOON
              </Link>
            )}
            <span className="flex items-center gap-1.5 text-primary-foreground/50">
              <Sparkles size={11} className="text-accent" />
              Free shipping over Rs.999
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/help" className="flex items-center gap-1.5 text-primary-foreground/50 hover:text-primary-foreground transition-colors">
              <Headphones size={11} />
              Help
            </Link>
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

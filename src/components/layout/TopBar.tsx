import { Store, LayoutDashboard, Shield, Headphones, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

const TopBar = () => {
  const { isAuthenticated, role, isSuperAdmin } = useAuth();

  return (
    <div className="hidden md:block bg-foreground text-background/70">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-8 text-[11px]">
          <div className="flex items-center gap-5">
            {isAuthenticated && isSuperAdmin && (
              <Link to="/admin/dashboard" className="flex items-center gap-1 text-primary font-semibold hover:text-primary/80 transition-colors">
                <Shield size={11} />
                Admin Panel
              </Link>
            )}
            {isAuthenticated && role === "seller" && (
              <Link to="/seller/dashboard" className="flex items-center gap-1 text-primary font-semibold hover:text-primary/80 transition-colors">
                <LayoutDashboard size={11} />
                Seller Dashboard
              </Link>
            )}
            {(!isAuthenticated || role === "customer") && (
              <Link to="/business/signup" className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                <Store size={11} />
                Sell on FANZOON
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Truck size={11} />
              Free shipping over Rs.999
            </span>
            <Link to="/help" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Headphones size={11} />
              Customer Support
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

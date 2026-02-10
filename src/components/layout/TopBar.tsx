import { Download, HelpCircle, Store, LayoutDashboard, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const TopBar = () => {
  const { t } = useLanguage();
  const { isAuthenticated, role, isSuperAdmin } = useAuth();
  
  return (
    <div className="hidden md:block bg-muted/50 border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-9 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {/* Show dashboard shortcuts for authenticated staff */}
            {isAuthenticated && isSuperAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-1.5 text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <Shield size={12} />
                Admin Panel
              </Link>
            )}
            {isAuthenticated && role === "seller" && (
              <Link 
                to="/seller/dashboard" 
                className="flex items-center gap-1.5 text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <LayoutDashboard size={12} />
                Seller Dashboard
              </Link>
            )}
            
            {/* Become a Partner - only show for non-sellers */}
            {(!isAuthenticated || role === "customer") && (
              <Link 
                to="/business/signup" 
                className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
              >
                <Store size={12} />
                Become a Partner
              </Link>
            )}
            
            <Link 
              to="/app" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Download size={12} />
              Download App
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle variant="compact" />
            <LanguageSwitcher variant="compact" />
            <Link 
              to="/help" 
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <HelpCircle size={12} />
              {t("nav.help")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

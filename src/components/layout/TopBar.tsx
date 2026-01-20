import { Download, HelpCircle, Store } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const TopBar = () => {
  const { t } = useLanguage();
  
  return (
    <div className="hidden md:block bg-secondary border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <Link 
              to="/sell" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Store size={12} />
              Sell on FANZON
            </Link>
            <Link 
              to="/app" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Download size={12} />
              Download App
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="compact" />
            <Link 
              to="/help" 
              className="flex items-center gap-1 hover:text-primary transition-colors"
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

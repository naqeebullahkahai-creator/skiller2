import { useState } from "react";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import MobileSearchOverlay from "@/components/mobile/MobileSearchOverlay";

const MobileHeader = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hidden = useScrollDirection();

  return (
    <>
      <header
        className="sticky top-0 z-50 safe-area-top transition-transform duration-300 will-change-transform"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="bg-accent px-4 pt-2 pb-3">
          {/* Top row: Logo + Cart */}
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/fanzoon-icon.png" alt="FANZON" className="h-8 w-8 object-contain" />
              <span className="font-display font-bold text-primary text-lg tracking-tight">FANZON</span>
            </Link>

            <div className="flex items-center gap-0.5">
              <Link
                to="/checkout"
                className="relative p-2.5 text-accent-foreground/80 active:scale-90 transition-transform touch-target flex items-center justify-center"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <Link
                  to="/account/notifications"
                  className="p-2.5 text-accent-foreground/80 active:scale-90 transition-transform touch-target flex items-center justify-center"
                >
                  <Bell size={22} />
                </Link>
              )}
            </div>
          </div>

          {/* Search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 h-10 px-4 bg-accent-foreground/10 backdrop-blur-sm rounded-lg text-accent-foreground/50 active:scale-[0.99] transition-all border border-accent-foreground/10"
          >
            <Search size={18} className="text-accent-foreground/40" />
            <span className="text-accent-foreground/40 text-[13px]">{t("search.placeholder")}</span>
          </button>
        </div>
      </header>

      <MobileSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default MobileHeader;

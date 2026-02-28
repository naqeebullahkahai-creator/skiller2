import { useState } from "react";
import { Search, ShoppingCart, MessageCircle, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useUnreadCount } from "@/hooks/useMessaging";
import MobileSearchOverlay from "@/components/mobile/MobileSearchOverlay";
import NotificationBell from "@/components/notifications/NotificationBell";

const MobileHeader = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const { items } = useCart();
  const { unreadCount } = useUnreadCount();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 safe-area-top">
        {/* Primary bar */}
        <div className="bg-primary px-3 pt-2 pb-2.5">
          {/* Top row: Logo + icons */}
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-primary-foreground">
                FANZOON
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {/* Messages */}
              {isAuthenticated && (
                <Link to="/account/messages" className="relative p-2 text-primary-foreground/90 active:scale-90 transition-transform">
                  <MessageCircle size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-accent text-accent-foreground text-[9px] font-bold rounded-full px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart */}
              <Link to="/checkout" className="relative p-2 text-primary-foreground/90 active:scale-90 transition-transform">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-accent text-accent-foreground text-[9px] font-bold rounded-full px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              {isAuthenticated && (
                <div className="text-primary-foreground/90">
                  <NotificationBell />
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2.5 h-9 px-3 bg-white rounded-md text-muted-foreground text-sm active:scale-[0.99] transition-all"
          >
            <Search size={16} className="text-primary" />
            <span className="text-muted-foreground/70 text-xs">{t("search.placeholder")}</span>
          </button>
        </div>
      </header>

      <MobileSearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default MobileHeader;

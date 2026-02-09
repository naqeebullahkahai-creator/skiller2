import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CreditCard,
  Truck,
  Shield,
  Headphones,
  Music2,
  MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const socialIconMap: Record<string, React.ReactNode> = {
  social_facebook: <Facebook size={18} />,
  social_instagram: <Instagram size={18} />,
  social_twitter: <Twitter size={18} />,
  social_youtube: <Youtube size={18} />,
  social_tiktok: <Music2 size={18} />,
  social_whatsapp: <MessageCircle size={18} />,
};

const Footer = () => {
  const { t } = useLanguage();
  const { getSocialLinks, isLoading } = useSiteSettings();
  
  const socialLinks = getSocialLinks();

  const getSocialUrl = (setting: { setting_key: string; setting_value: string | null }) => {
    if (setting.setting_key === 'social_whatsapp') {
      const phone = setting.setting_value?.replace(/\D/g, '') || '';
      return `https://wa.me/${phone}`;
    }
    return setting.setting_value || '#';
  };
  
  return (
    <footer className="hidden md:block bg-fanzon-dark text-secondary mt-8">
      {/* Features Bar */}
      <div className="border-b border-muted-foreground/20">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("footer.free_delivery")}</p>
                <p className="text-xs text-muted-foreground">{t("footer.free_delivery_desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("footer.secure_payment")}</p>
                <p className="text-xs text-muted-foreground">{t("footer.secure_payment_desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("footer.easy_returns")}</p>
                <p className="text-xs text-muted-foreground">{t("footer.easy_returns_desc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("footer.support_24_7")}</p>
                <p className="text-xs text-muted-foreground">{t("footer.support_desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Customer Care */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.customer_care")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t("nav.help")}</Link></li>
              <li><Link to="/how-to-buy" className="hover:text-primary transition-colors">How to Buy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About FANZON */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.about")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Make Money with Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/business/signup" className="hover:text-primary transition-colors">Become a Partner</Link></li>
              <li><Link to="/business/login" className="hover:text-primary transition-colors">Seller Central</Link></li>
              <li><Link to="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link to="/vendor-support" className="hover:text-primary transition-colors">Vendor Support</Link></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.payment")}</h4>
            <div className="flex flex-wrap gap-2">
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Visa</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Mastercard</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">JazzCash</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Easypaisa</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">COD</div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4">{t("footer.stay_connected")}</h4>
            <p className="text-sm text-muted-foreground mb-3">{t("footer.subscribe_desc")}</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-muted border-muted-foreground/30 text-sm h-9"
              />
              <Button size="sm" className="h-9">
                {t("footer.subscribe")}
              </Button>
            </div>
            {/* Dynamic Social Links */}
            {!isLoading && socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socialLinks.map((setting) => (
                  <a 
                    key={setting.setting_key}
                    href={getSocialUrl(setting)} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={setting.setting_key.replace('social_', '')}
                  >
                    {socialIconMap[setting.setting_key]}
                  </a>
                ))}
              </div>
            )}
            {/* Fallback static links if loading or no settings */}
            {(isLoading || socialLinks.length === 0) && (
              <div className="flex gap-3 mt-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter size={18} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube size={18} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted-foreground/20">
        <div className="container mx-auto py-4">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 FANZON. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

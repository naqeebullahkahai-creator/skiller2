import { Link } from "react-router-dom";
import { 
  Facebook, Twitter, Instagram, Youtube,
  CreditCard, Truck, Shield, Headphones,
  Music2, MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import FanzonLogo from "@/components/brand/FanzonLogo";

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
    <footer className="hidden md:block bg-foreground text-background mt-10">
      {/* Features Bar */}
      <div className="border-b border-background/10">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: t("footer.free_delivery"), desc: t("footer.free_delivery_desc") },
              { icon: Shield, title: t("footer.secure_payment"), desc: t("footer.secure_payment_desc") },
              { icon: CreditCard, title: t("footer.easy_returns"), desc: t("footer.easy_returns_desc") },
              { icon: Headphones, title: t("footer.support_24_7"), desc: t("footer.support_desc") },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-4">
                <div className="p-3 bg-primary/15 rounded-2xl">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-background/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary">{t("footer.customer_care")}</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t("nav.help")}</Link></li>
              <li><Link to="/how-to-buy" className="hover:text-primary transition-colors">How to Buy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary">{t("footer.about")}</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary">Make Money with Us</h4>
            <ul className="space-y-2.5 text-sm text-background/60">
              <li><Link to="/business/signup" className="hover:text-primary transition-colors">Become a Partner</Link></li>
              <li><Link to="/business/login" className="hover:text-primary transition-colors">Seller Central</Link></li>
              <li><Link to="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link to="/vendor-support" className="hover:text-primary transition-colors">Vendor Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary">{t("footer.payment")}</h4>
            <div className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", "JazzCash", "Easypaisa", "COD"].map((method) => (
                <div key={method} className="bg-background/5 border border-background/15 px-2.5 py-1 rounded-lg text-xs">
                  {method}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-primary">{t("footer.stay_connected")}</h4>
            <p className="text-sm text-background/50 mb-3">{t("footer.subscribe_desc")}</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-background/5 border-background/15 text-sm h-10 rounded-xl text-background placeholder:text-background/30"
              />
              <Button size="sm" className="h-10 rounded-xl px-4 btn-gold">
                {t("footer.subscribe")}
              </Button>
            </div>
            <div className="flex gap-3 mt-5">
              {!isLoading && socialLinks.length > 0 ? (
                socialLinks.map((setting) => (
                  <a 
                    key={setting.setting_key}
                    href={getSocialUrl(setting)} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-background/5 border border-background/15 flex items-center justify-center text-background/50 hover:text-primary hover:border-primary/40 transition-all"
                  >
                    {socialIconMap[setting.setting_key]}
                  </a>
                ))
              ) : (
                [Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-background/5 border border-background/15 flex items-center justify-center text-background/50 hover:text-primary hover:border-primary/40 transition-all">
                    <Icon size={18} />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto py-5 flex items-center justify-between">
          <img src="/fanzoon-icon.png" alt="FANZON" className="h-8 w-8 object-contain opacity-80" />
          <p className="text-xs text-background/40">
            © 2026 FANZON. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

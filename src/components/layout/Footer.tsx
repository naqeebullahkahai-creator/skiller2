import { Link } from "react-router-dom";
import { 
  Facebook, Twitter, Instagram, Youtube,
  Music2, MessageCircle, Banknote,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const socialIconMap: Record<string, React.ReactNode> = {
  social_facebook: <Facebook size={16} />,
  social_instagram: <Instagram size={16} />,
  social_twitter: <Twitter size={16} />,
  social_youtube: <Youtube size={16} />,
  social_tiktok: <Music2 size={16} />,
  social_whatsapp: <MessageCircle size={16} />,
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

  const paymentMethods = [
    { name: "Cash on Delivery", icon: <Banknote size={14} /> },
  ];
  
  return (
    <footer className="hidden md:block bg-foreground text-primary-foreground/80 mt-12">
      {/* Newsletter Strip */}
      <div className="bg-primary">
        <div className="container mx-auto py-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-bold text-primary-foreground tracking-tight">Stay in the loop</h3>
            <p className="text-xs text-primary-foreground/60">Get exclusive deals & new arrivals straight to your inbox</p>
          </div>
          <div className="flex gap-2">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-primary-foreground/10 border-primary-foreground/15 text-sm h-10 w-64 rounded-xl text-primary-foreground placeholder:text-primary-foreground/30 focus-visible:ring-primary-foreground/30"
            />
            <Button size="sm" className="h-10 rounded-xl px-5 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              Subscribe
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-primary-foreground">{t("footer.customer_care")}</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/50">
              <li><Link to="/help" className="hover:text-primary transition-colors">{t("nav.help")}</Link></li>
              <li><Link to="/how-to-buy" className="hover:text-primary transition-colors">How to Buy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-primary-foreground">{t("footer.about")}</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/50">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-primary-foreground">Make Money</h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/50">
              <li><Link to="/business/signup" className="hover:text-primary transition-colors">Become a Partner</Link></li>
              <li><Link to="/business/login" className="hover:text-primary transition-colors">Seller Central</Link></li>
              <li><Link to="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link to="/vendor-support" className="hover:text-primary transition-colors">Vendor Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-primary-foreground">{t("footer.payment")}</h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <div key={method.name} className="bg-primary-foreground/5 border border-primary-foreground/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                  {method.type === "image" ? (
                    <img src={method.logo} alt={method.name} className="h-4 w-4 object-contain rounded-sm" />
                  ) : (
                    <span className="text-primary-foreground/40">{method.icon}</span>
                  )}
                  <span className="text-[11px] font-medium text-primary-foreground/60">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-4 text-primary-foreground">Follow Us</h4>
            <div className="flex flex-wrap gap-2">
              {!isLoading && socialLinks.length > 0 ? (
                socialLinks.map((setting) => (
                  <a 
                    key={setting.setting_key}
                    href={getSocialUrl(setting)} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/40 hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all"
                  >
                    {socialIconMap[setting.setting_key]}
                  </a>
                ))
              ) : (
                [Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/40 hover:text-primary hover:border-primary/30 transition-all">
                    <Icon size={16} />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/8">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fanzoon-icon.png" alt="FANZON" className="h-6 w-6 object-contain opacity-60" />
            <span className="text-sm font-display font-bold text-primary-foreground/40">FANZOON</span>
          </div>
          <p className="text-[11px] text-primary-foreground/30">
            © 2026 FANZOON. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

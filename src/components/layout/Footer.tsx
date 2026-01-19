import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CreditCard,
  Truck,
  Shield,
  Headphones
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-fanzon-dark text-secondary mt-8 pb-20 md:pb-0">
      {/* Features Bar */}
      <div className="border-b border-muted-foreground/20">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over ৳999</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% Protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-day returns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">24/7 Support</p>
                <p className="text-xs text-muted-foreground">Dedicated support</p>
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
            <h4 className="font-semibold text-sm mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/how-to-buy" className="hover:text-primary transition-colors">How to Buy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* About FANZON */}
          <div>
            <h4 className="font-semibold text-sm mb-4">About FANZON</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Earn With FANZON */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Earn With FANZON</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/sell" className="hover:text-primary transition-colors">Sell on FANZON</Link></li>
              <li><Link to="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link to="/vendor-support" className="hover:text-primary transition-colors">Vendor Support</Link></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Visa</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Mastercard</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">bKash</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">Nagad</div>
              <div className="bg-card px-2 py-1 rounded text-xs text-foreground">COD</div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Stay Connected</h4>
            <p className="text-sm text-muted-foreground mb-3">Subscribe for exclusive deals</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-muted border-muted-foreground/30 text-sm h-9"
              />
              <Button size="sm" className="h-9">
                Subscribe
              </Button>
            </div>
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

import { Wrench, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg">
            <span className="text-3xl font-bold tracking-tight">FANZON</span>
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Wrench className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            We'll Be Back Soon!
          </h1>
          <p className="text-lg text-muted-foreground">
            We're currently performing scheduled maintenance to improve your shopping experience.
          </p>
        </div>

        {/* Estimated Time */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <span>Estimated downtime: 30 minutes</span>
        </div>

        {/* Features Being Updated */}
        <div className="bg-card border border-border rounded-lg p-6 text-left space-y-3">
          <h3 className="font-semibold text-foreground">What we're working on:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Improving site performance
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Enhancing security features
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Adding new payment options
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Need urgent assistance? Contact us:
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@fanzon.pk" className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@fanzon.pk
            </a>
          </Button>
        </div>

        {/* Social Links */}
        <p className="text-xs text-muted-foreground">
          Follow us on social media for updates
        </p>
      </div>
    </div>
  );
};

export default Maintenance;

import { Wrench, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Maintenance = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-lg">
            <span className="text-4xl font-bold tracking-tight">FANZON</span>
          </div>
        </div>

        {/* Maintenance Icon */}
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
            <Wrench className="w-14 h-14 text-primary animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            We'll Be Back Shortly!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are currently updating the store for a better experience. 
            We will be back shortly!
          </p>
        </div>

        {/* Refresh Button */}
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Check Again
        </Button>

        {/* Contact */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need urgent assistance? Contact us:
          </p>
          <Button variant="ghost" asChild>
            <a href="mailto:support@fanzon.pk" className="inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              support@fanzon.pk
            </a>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4">
          Thank you for your patience. We're making FANZON even better for you!
        </p>
      </div>
    </div>
  );
};

export default Maintenance;

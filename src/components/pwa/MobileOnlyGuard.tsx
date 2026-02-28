import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import FanzonLogo from "@/components/brand/FanzonLogo";

interface MobileOnlyGuardProps {
  children: React.ReactNode;
  appName?: string;
}

const MobileOnlyGuard = ({ children, appName = "FANZON" }: MobileOnlyGuardProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <Smartphone size={40} className="text-primary" />
          </div>
          <FanzonLogo size="lg" />
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Mobile App Only
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {appName} app sirf mobile devices ke liye hai. Apne phone se is link ko kholein ya QR code scan karein.
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <p className="text-sm font-medium text-foreground">How to install:</p>
            <ol className="text-sm text-muted-foreground text-left space-y-2">
              <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Open this URL on your phone</li>
              <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Tap "Add to Home Screen"</li>
              <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Open the app from your home screen</li>
            </ol>
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Download size={14} />
            <span>Best experience on mobile browser</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileOnlyGuard;

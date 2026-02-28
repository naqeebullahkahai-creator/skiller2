import { useIsMobile } from "@/hooks/use-mobile";
import { Smartphone } from "lucide-react";

interface MobileOnlyGuardProps {
  children: React.ReactNode;
  appName?: string;
}

const MobileOnlyGuard = ({ children, appName = "FANZOON" }: MobileOnlyGuardProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">Mobile Only</h1>
            <p className="text-sm text-muted-foreground">
              {appName} sirf mobile par available hai. Apne phone se kholein.
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 text-left">
            <p className="text-xs font-semibold text-foreground mb-2">Install kaise karein:</p>
            <ol className="text-xs text-muted-foreground space-y-1.5">
              <li><span className="text-primary font-bold">1.</span> Phone browser mein kholein</li>
              <li><span className="text-primary font-bold">2.</span> "Add to Home Screen" dabayein</li>
              <li><span className="text-primary font-bold">3.</span> Home screen se open karein</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileOnlyGuard;

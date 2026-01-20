import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <div className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg shadow-lg">
            <span className="text-2xl font-bold tracking-tight">FANZON</span>
          </div>
        </div>

        {/* Offline Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Message - English & Urdu */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-foreground">
            You are offline
          </h2>
          <p className="text-muted-foreground">
            آپ آف لائن ہیں - نیٹ چیک کریں
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your internet connection and try again.
          </p>
        </div>

        {/* Retry Button */}
        <Button
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw size={18} />
          Try Again
        </Button>

        {/* Cached Content Notice */}
        <p className="text-xs text-muted-foreground">
          Some previously viewed content may still be available.
        </p>
      </div>
    </div>
  );
};

export default OfflineIndicator;

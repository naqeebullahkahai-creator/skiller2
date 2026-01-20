import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const NotificationPermissionBanner = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !isMobile) return;

    // Check if already asked or subscribed
    const dismissed = localStorage.getItem("notification-permission-dismissed");
    const hasPermission = Notification.permission === "granted";

    if (!dismissed && !hasPermission && Notification.permission !== "denied") {
      // Delay showing the banner
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, isMobile]);

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        // Register service worker and subscribe
        const registration = await navigator.serviceWorker.ready;
        
        // Note: In production, you'd use actual VAPID keys
        // For now, we'll just store the permission status
        console.log("Push notifications enabled");
        
        setShowBanner(false);
        localStorage.setItem("notification-permission-granted", "true");
      } else {
        console.log("Push notification permission denied");
        setShowBanner(false);
        localStorage.setItem("notification-permission-dismissed", "true");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification-permission-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
            <Bell size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Turn on Notifications</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Get alerts for order updates, new messages, and special offers!
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEnableNotifications}
                disabled={isSubscribing}
                className="text-xs h-8"
              >
                {isSubscribing ? "Enabling..." : "Enable"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-8"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;

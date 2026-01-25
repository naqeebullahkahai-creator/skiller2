import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PushNotificationToggle = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) return;
      }
      await subscribe();
    }
  };

  if (!isSupported) {
    return (
      <Card className="opacity-60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BellOff className="h-4 w-4" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-xs">
            Not supported on this device/browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Push Notifications
        </CardTitle>
        <CardDescription className="text-xs">
          Get instant alerts for orders, low stock, and promotions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="push-toggle" className="text-sm font-medium">
              {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {permission === "denied" 
                ? "Blocked in browser settings" 
                : isSubscribed 
                  ? "You'll receive real-time updates"
                  : "Turn on to stay updated"
              }
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              id="push-toggle"
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={permission === "denied"}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationToggle;

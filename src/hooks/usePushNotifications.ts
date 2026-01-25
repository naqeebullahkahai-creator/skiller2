import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check existing subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isSupported) return;

      try {
        const { data } = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        setIsSubscribed(!!data);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [user, isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported on this device");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === "granted") {
      toast.success("Notification permissions granted!");
      return true;
    } else if (result === "denied") {
      toast.error("Notification permissions denied. Please enable in browser settings.");
      return false;
    }
    
    return false;
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported || permission !== "granted") {
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // For demo purposes, we'll use a placeholder VAPID key
        // In production, generate proper VAPID keys
        const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
        
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      const subscriptionJson = subscription.toJSON();
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      };

      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
      }, {
        onConflict: "user_id",
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success("Push notifications enabled!");
      return true;
    } catch (error: any) {
      console.error("Error subscribing to push:", error);
      toast.error("Failed to enable push notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);

      setIsSubscribed(false);
      toast.success("Push notifications disabled");
      return true;
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to disable push notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Show local notification (for order updates, etc.)
  const showLocalNotification = useCallback((title: string, body: string, url?: string) => {
    if (!isSupported || permission !== "granted") return;

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: "/fanzon-icon-512.png",
        badge: "/fanzon-icon-512.png",
        tag: `fanzon-${Date.now()}`,
        data: { url },
        vibrate: [200, 100, 200],
      });
    });
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Hook to send low stock alerts to sellers
export const useLowStockAlert = () => {
  const { user } = useAuth();

  const checkLowStock = useCallback(async () => {
    if (!user) return [];

    const { data: products } = await supabase
      .from("products")
      .select("id, title, stock_count")
      .eq("seller_id", user.id)
      .eq("status", "active")
      .lt("stock_count", 5);

    return products || [];
  }, [user]);

  return { checkLowStock };
};

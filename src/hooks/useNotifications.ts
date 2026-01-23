import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationType = "order" | "price_drop" | "promotion" | "system" | "wallet" | "stock";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notifications when userId changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setNotifications([]);
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to realtime updates for new notifications
    if (userId) {
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]);
            setUnreadCount((prev) => prev + 1);

            // Show toast notification
            showNotificationToast(newNotification);

            // Show browser notification if permission granted
            if (Notification.permission === "granted") {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                tag: newNotification.id,
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  // Show toast notification based on type
  const showNotificationToast = (notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      action: notification.link ? {
        label: "View",
        onClick: () => window.location.href = notification.link!,
      } : undefined,
    };

    switch (notification.notification_type) {
      case "order":
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case "wallet":
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case "stock":
        toast.warning(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case "promotion":
        toast(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      default:
        toast(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
    }
  };

  const markAsRead = async (id: string) => {
    if (!userId) return;
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    if (!userId) return;
    const notification = notifications.find(n => n.id === id);
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteAllNotifications = async () => {
    if (!userId) return;
    await supabase.from("notifications").delete().eq("user_id", userId);
    setNotifications([]);
    setUnreadCount(0);
  };

  const refetch = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  };
};

// Utility function to create notifications (for use in other hooks/components)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) => {
  try {
    const notificationData: {
      user_id: string;
      title: string;
      message: string;
      notification_type: "order" | "price_drop" | "promotion" | "system";
      link: string | null;
    } = {
      user_id: userId,
      title,
      message,
      notification_type: type === "wallet" || type === "stock" ? "system" : type,
      link: link || null,
    };
    
    await supabase.from("notifications").insert(notificationData);
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

import { useState, useEffect } from "react";
import { Bell, Package, TrendingDown, Megaphone, Info, Check } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: "order" | "price_drop" | "promotion" | "system";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: Notification["notification_type"]) => {
  switch (type) {
    case "order":
      return <Package size={18} className="text-primary" />;
    case "price_drop":
      return <TrendingDown size={18} className="text-green-600" />;
    case "promotion":
      return <Megaphone size={18} className="text-orange-500" />;
    default:
      return <Info size={18} className="text-muted-foreground" />;
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Notifications</h2>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
            <Check size={14} className="mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 h-9">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="unread" className="text-xs">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-3 animate-pulse border">
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-muted rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          type="default"
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description={filter === "unread" 
            ? "You've read all your notifications!"
            : "We'll notify you about orders, messages, and promotions."}
          actionLabel="Browse Products"
          actionHref="/products"
          icon={<Bell size={48} strokeWidth={1.5} />}
        />
      ) : (
        <div className="space-y-1.5">
          {filteredNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "w-full text-left bg-card rounded-lg p-3 border transition-colors",
                !notification.is_read && "bg-primary/5 border-primary/20",
                notification.link && "hover:bg-muted cursor-pointer active:scale-[0.99]"
              )}
            >
              <div className="flex gap-3">
                <div className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                  !notification.is_read ? "bg-primary/10" : "bg-muted"
                )}>
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      "text-sm leading-tight",
                      !notification.is_read && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

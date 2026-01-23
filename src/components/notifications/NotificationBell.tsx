import { Bell, Package, TrendingDown, Megaphone, Info, Check, Wallet, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications, NotificationType } from "@/hooks/useNotifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "order":
      return <Package size={16} className="text-primary" />;
    case "price_drop":
      return <TrendingDown size={16} className="text-green-600" />;
    case "promotion":
      return <Megaphone size={16} className="text-orange-500" />;
    case "wallet":
      return <Wallet size={16} className="text-green-600" />;
    case "stock":
      return <AlertTriangle size={16} className="text-amber-500" />;
    default:
      return <Info size={16} className="text-muted-foreground" />;
  }
};

const getNotificationBgColor = (type: NotificationType) => {
  switch (type) {
    case "order":
      return "bg-primary/10";
    case "wallet":
      return "bg-green-500/10";
    case "stock":
      return "bg-amber-500/10";
    case "promotion":
      return "bg-orange-500/10";
    default:
      return "bg-muted";
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-primary-foreground hover:bg-primary/80"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <Check size={14} className="mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you about orders, updates & more
              </p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer border-b border-border/50 last:border-0",
                  !notification.is_read && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={cn(
                  "mt-0.5 p-1.5 rounded-full",
                  getNotificationBgColor(notification.notification_type)
                )}>
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm line-clamp-1",
                    !notification.is_read && "font-medium"
                  )}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-1 animate-pulse" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => navigate("/account/notifications")}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

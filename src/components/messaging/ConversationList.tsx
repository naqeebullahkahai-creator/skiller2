import { Loader2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/useMessaging";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  userRole: "customer" | "seller";
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "dd/MM/yy");
};

const ConversationList = ({
  conversations,
  loading,
  selectedId,
  onSelect,
  userRole,
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-medium text-foreground">No messages yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {userRole === "seller"
            ? "Your customer messages will appear here"
            : "Start chatting with sellers"}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {conversations.map((conv) => {
          const displayName =
            userRole === "seller" ? conv.customer_name : conv.seller_name;
          const isSelected = selectedId === conv.id;

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                isSelected && "bg-muted"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {displayName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(conv.last_message_at)}
                    </span>
                  </div>

                  {conv.product_title && (
                    <p className="text-xs text-primary truncate mt-0.5">
                      Re: {conv.product_title}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.last_message || "No messages yet"}
                    </p>
                    {(conv.unread_count ?? 0) > 0 && (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground text-xs h-5 min-w-5 flex items-center justify-center shrink-0"
                      >
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationList;

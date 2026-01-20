import { useState, useEffect, useRef } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMessages, useSendMessage, useMarkAsRead, Conversation } from "@/hooks/useMessaging";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  onClose?: () => void;
  isFloating?: boolean;
}

const ChatWindow = ({ conversation, currentUserId, onClose, isFloating = false }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { messages, loading } = useMessages(conversation.id);
  const { sendMessage } = useSendMessage();
  const { markAsRead } = useMarkAsRead();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustomer = currentUserId === conversation.customer_id;
  const otherPartyName = isCustomer ? conversation.seller_name : conversation.customer_name;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversation.id && currentUserId) {
      markAsRead(conversation.id, currentUserId);
    }
  }, [conversation.id, currentUserId, messages.length, markAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(conversation.id, newMessage.trim());
    if (success) {
      setNewMessage("");
      inputRef.current?.focus();
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-background border border-border rounded-lg overflow-hidden",
      isFloating ? "fixed bottom-20 right-4 w-80 md:w-96 h-[500px] shadow-xl z-50" : "h-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-foreground text-primary text-sm">
              {otherPartyName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{otherPartyName}</p>
            {conversation.product_title && (
              <p className="text-xs opacity-80 truncate max-w-[150px]">
                Re: {conversation.product_title}
              </p>
            )}
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-3 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {format(new Date(message.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="bg-primary hover:bg-primary/90 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Star, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSupportSession, useChatShortcuts } from "@/hooks/useSupportChat";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const { user, role } = useAuth();
  const { session, messages, loading, createSession, sendMessage, endSession, rateSession } = useSupportSession();
  const { shortcuts } = useChatShortcuts();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Only show for customers - NEVER for admin/seller
  if (!user || role === "admin" || role === "seller") return null;

  const handleOpen = async () => {
    setIsOpen(true);
    if (!session) {
      await createSession();
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    await sendMessage(messageText);
    setInput("");
  };

  const handleEndChat = () => {
    setShowRating(true);
  };

  const handleSubmitRating = async () => {
    if (rating > 0) {
      await rateSession(rating, feedbackText.trim() || undefined);
    }
    await endSession();
    setShowRating(false);
    setRating(0);
    setFeedbackText("");
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-20 md:bottom-6 right-4 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all",
          isOpen && "hidden"
        )}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "520px" }}>
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold">FANZON Support</h3>
                <p className="text-xs text-primary-foreground/80">
                  {session?.status === 'active' ? '🟢 Connected to agent' : 'Send us a message'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {session && session.status !== 'ended' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEndChat}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  title="End Chat"
                >
                  <PhoneOff size={18} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {showRating ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Rate your experience</h3>
                <p className="text-sm text-muted-foreground">How was your chat with our support team?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          (hoverRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Tell us about your experience (optional)"
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <Button onClick={handleSubmitRating} className="w-full">
                  {rating > 0 ? 'Submit & Close' : 'Skip & Close'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {loading && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!loading && messages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary/50" />
                      <p className="text-sm font-medium">How can we help you?</p>
                      <p className="text-xs mt-1">Send a message and our team will respond as soon as possible.</p>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}>
                          <p className="break-words">{msg.content}</p>
                          <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {shortcuts.length > 0 && messages.length < 2 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {shortcuts.slice(0, 4).map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSend(s.message)}
                        className="text-xs bg-muted hover:bg-primary/10 text-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={() => handleSend()} disabled={!input.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Star, PhoneOff, Bot, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSupportSession, useChatShortcuts } from "@/hooks/useSupportChat";
import { useChatbotFAQs, findBotAnswer } from "@/hooks/useChatbot";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface LocalMessage {
  id: string;
  content: string;
  sender: "user" | "bot" | "agent";
  timestamp: Date;
}

const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [mode, setMode] = useState<"bot" | "agent">("bot");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [botTyping, setBotTyping] = useState(false);
  const { user, role } = useAuth();
  const { session, messages: agentMessages, loading, createSession, sendMessage, endSession, rateSession } = useSupportSession();
  const { shortcuts } = useChatShortcuts();
  const { data: faqs = [] } = useChatbotFAQs();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, agentMessages, botTyping]);

  const addBotMessage = useCallback((content: string) => {
    setBotTyping(true);
    setTimeout(() => {
      setLocalMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        content,
        sender: "bot",
        timestamp: new Date(),
      }]);
      setBotTyping(false);
    }, 800);
  }, []);

  // Only show for customers
  if (!user || role === "admin" || role === "seller" || role === "support_agent") return null;

  const handleOpen = () => {
    setIsOpen(true);
    if (localMessages.length === 0 && mode === "bot") {
      setLocalMessages([{
        id: "welcome",
        content: "Assalam o Alaikum! 👋 Welcome to FANZON Support. I'm your virtual assistant. Ask me anything about orders, shipping, returns, payments, or FANZON services!\n\nYou can also type 'agent' to connect with a live support agent.",
        sender: "bot",
        timestamp: new Date(),
      }]);
    }
  };

  const handleSendBot = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setLocalMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      content: messageText,
      sender: "user",
      timestamp: new Date(),
    }]);
    setInput("");

    if (messageText.toLowerCase().includes("agent") || messageText.toLowerCase().includes("human") || messageText.toLowerCase().includes("live")) {
      addBotMessage("Connecting you to a live FANZON support agent... Please wait a moment. 🔄");
      setTimeout(() => switchToAgent(), 1500);
      return;
    }

    const result = findBotAnswer(messageText, faqs);
    if (result) {
      addBotMessage(result.answer);
    } else {
      addBotMessage("I'm sorry, I couldn't find an answer to that. I can help with:\n\n• 📦 Shipping & Delivery\n• 🔄 Returns & Refunds\n• 💳 Payments\n• 👤 Account Help\n• 🏪 Selling on FANZON\n\nOr type 'agent' to chat with a live support agent!");
    }
  };

  const switchToAgent = async () => {
    setMode("agent");
    await createSession("Transferred from chatbot");
  };

  const handleSendAgent = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    await sendMessage(messageText);
    setInput("");
  };

  const handleSend = (text?: string) => {
    if (mode === "bot") handleSendBot(text);
    else handleSendAgent(text);
  };

  const handleEndChat = () => setShowRating(true);

  const handleSubmitRating = async () => {
    if (rating > 0) await rateSession(rating, feedbackText.trim() || undefined);
    await endSession();
    setShowRating(false);
    setRating(0);
    setFeedbackText("");
    setMode("bot");
    setLocalMessages([]);
    setIsOpen(false);
  };

  const FAQ_CATEGORIES = [
    { label: "📦 Shipping", query: "How long does delivery take?" },
    { label: "🔄 Returns", query: "What is the return policy?" },
    { label: "💳 Payments", query: "What payment methods are accepted?" },
    { label: "💰 Wallet", query: "What is FANZON Wallet?" },
  ];

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
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "560px" }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                {mode === "bot" ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {mode === "bot" ? "FANZON Assistant" : "FANZON Support"}
                </h3>
                <p className="text-xs text-primary-foreground/80">
                  {mode === "bot" 
                    ? "🤖 AI Assistant" 
                    : session?.status === "active" 
                      ? "🟢 Connected to agent" 
                      : "⏳ Waiting for agent..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {mode === "agent" && session && session.status !== "ended" && (
                <Button variant="ghost" size="icon" onClick={handleEndChat}
                  className="text-primary-foreground hover:bg-primary-foreground/20">
                  <PhoneOff size={18} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20">
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
                    <button key={star} onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110">
                      <Star size={32} className={cn("transition-colors",
                        (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )} />
                    </button>
                  ))}
                </div>
                <textarea placeholder="Tell us about your experience (optional)" value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" rows={3} />
                <Button onClick={handleSubmitRating} className="w-full">
                  {rating > 0 ? "Submit & Close" : "Skip & Close"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {mode === "bot" ? (
                    <>
                      {localMessages.map(msg => (
                        <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                            msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            <p className="break-words whitespace-pre-line">{msg.content}</p>
                            <p className={cn("text-[10px] mt-1", msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {format(msg.timestamp, "HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))}
                      {botTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-xl px-4 py-3">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {loading && (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {!loading && agentMessages.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-primary/50" />
                          <p className="text-sm font-medium">Connecting to a support agent...</p>
                          <p className="text-xs mt-1">Please wait, our team will be with you shortly.</p>
                        </div>
                      )}
                      {agentMessages.map(msg => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm",
                              isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                            )}>
                              <p className="break-words">{msg.content}</p>
                              <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                {format(new Date(msg.created_at), "HH:mm")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {mode === "bot" && localMessages.length <= 1 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {FAQ_CATEGORIES.map(cat => (
                      <button key={cat.label} onClick={() => handleSendBot(cat.query)}
                        className="text-xs bg-muted hover:bg-primary/10 text-foreground px-3 py-1.5 rounded-full border border-border transition-colors">
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={switchToAgent}
                    className="mt-2 w-full text-xs text-primary hover:underline flex items-center justify-center gap-1">
                    <User size={12} /> Talk to a live agent <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {mode === "agent" && shortcuts.length > 0 && agentMessages.length < 2 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {shortcuts.slice(0, 4).map(s => (
                      <button key={s.id} onClick={() => handleSendAgent(s.message)}
                        className="text-xs bg-muted hover:bg-primary/10 text-foreground px-3 py-1.5 rounded-full border border-border transition-colors">
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input placeholder={mode === "bot" ? "Ask about FANZON..." : "Type a message..."}
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()} className="flex-1" />
                  <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || botTyping}>
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

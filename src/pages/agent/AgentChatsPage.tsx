import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Clock, Users, Send, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useChatShortcuts } from "@/hooks/useSupportChat";

interface SupportMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const AgentChatsPage = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { shortcuts } = useChatShortcuts();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Agent profile for online status
  const { data: agentProfile } = useQuery({
    queryKey: ["agent-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("support_agent_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (agentProfile) setIsOnline((agentProfile as any).is_online);
  }, [agentProfile]);

  // Active sessions
  const { data: activeSessions = [] } = useQuery({
    queryKey: ["agent-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("support_chat_sessions").select("*").eq("agent_id", user.id).eq("status", "active").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Waiting sessions
  const { data: waitingSessions = [] } = useQuery({
    queryKey: ["waiting-sessions"],
    queryFn: async () => {
      const { data } = await supabase.from("support_chat_sessions").select("*").eq("status", "waiting").is("agent_id", null).order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user && isOnline,
  });

  // User names
  const { data: sessionUsers = {} } = useQuery({
    queryKey: ["session-users", activeSessions.map((s: any) => s.user_id).concat(waitingSessions.map((s: any) => s.user_id))],
    queryFn: async () => {
      const userIds = [...new Set([...activeSessions.map((s: any) => s.user_id), ...waitingSessions.map((s: any) => s.user_id)])];
      if (userIds.length === 0) return {};
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const map: Record<string, string> = {};
      data?.forEach(p => { map[p.id] = p.full_name || "User"; });
      return map;
    },
    enabled: activeSessions.length > 0 || waitingSessions.length > 0,
  });

  // Realtime for sessions
  useEffect(() => {
    const channel = supabase
      .channel("agent-chats-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_chat_sessions" }, (payload) => {
        if (payload.eventType === "INSERT" && (payload.new as any).status === "waiting") {
          toast.info("🆘 New support request!", { duration: 4000 });
        }
        queryClient.invalidateQueries({ queryKey: ["agent-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["waiting-sessions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Chat messages
  useEffect(() => {
    if (!activeChat) { setChatMessages([]); return; }
    const loadMessages = async () => {
      const { data } = await supabase.from("support_messages").select("*").eq("session_id", activeChat).order("created_at");
      setChatMessages((data || []) as SupportMessage[]);
    };
    loadMessages();
    const channel = supabase
      .channel(`agent-chat-${activeChat}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `session_id=eq.${activeChat}` },
        (payload) => setChatMessages(prev => [...prev, payload.new as SupportMessage])
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  const toggleOnline = useMutation({
    mutationFn: async (online: boolean) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("support_agent_profiles").update({ is_online: online, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      await supabase.from("agent_online_status").upsert({ user_id: user.id, is_online: online, last_seen_at: new Date().toISOString() });
    },
    onSuccess: (_, online) => {
      setIsOnline(online);
      toast.success(online ? "You are now online" : "You are now offline");
      queryClient.invalidateQueries({ queryKey: ["agent-profile"] });
    },
  });

  const claimSession = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("support_chat_sessions").update({ agent_id: user.id, status: "active", started_at: new Date().toISOString() }).eq("id", sessionId).is("agent_id", null);
      if (error) throw error;
      await supabase.from("support_messages").insert({ session_id: sessionId, sender_id: user.id, content: `Assalam o Alaikum! 👋 I'm ${profile?.full_name || "your support agent"}. How can I help you today?` });
    },
    onSuccess: (_, sessionId) => {
      toast.success("Session claimed!");
      setActiveChat(sessionId);
      queryClient.invalidateQueries({ queryKey: ["agent-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-sessions"] });
    },
    onError: () => toast.error("Could not claim session"),
  });

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || chatInput.trim();
    if (!content || !activeChat || !user) return;
    setChatInput("");
    await supabase.from("support_messages").insert({ session_id: activeChat, sender_id: user.id, content });
  }, [activeChat, chatInput, user]);

  const endChat = useMutation({
    mutationFn: async (sessionId: string) => {
      await supabase.from("support_chat_sessions").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", sessionId);
    },
    onSuccess: () => {
      toast.success("Chat ended");
      setActiveChat(null);
      queryClient.invalidateQueries({ queryKey: ["agent-sessions"] });
    },
  });

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Online Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> Live Chats
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>
          <Switch checked={isOnline} onCheckedChange={(c) => toggleOnline.mutate(c)} />
          <Badge variant={isOnline ? "default" : "secondary"} className={cn("text-xs", isOnline && "bg-green-500")}>
            {isOnline ? "🟢" : "⚪"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Queue + Sessions */}
        <div className="space-y-3">
          {isOnline && waitingSessions.length > 0 && (
            <Card>
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" /> Queue ({waitingSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {waitingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{(sessionUsers as any)[session.user_id] || "User"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.subject || "General"}</p>
                    </div>
                    <Button size="sm" className="h-7 text-xs shrink-0 ml-2" onClick={() => claimSession.mutate(session.id)} disabled={claimSession.isPending}>Accept</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Active ({activeSessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-2">
              {activeSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-xs">
                  {isOnline ? "No active sessions." : "Go online to receive chats."}
                </p>
              ) : (
                activeSessions.map((session: any) => (
                  <button key={session.id}
                    className={cn("flex items-center justify-between p-2 rounded-lg w-full text-left transition-colors",
                      activeChat === session.id ? "bg-primary/10 border border-primary/30" : "bg-muted hover:bg-accent"
                    )}
                    onClick={() => setActiveChat(session.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {((sessionUsers as any)[session.user_id] || "U").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{(sessionUsers as any)[session.user_id] || "User"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{session.subject || "General"}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-[10px] shrink-0">Active</Badge>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="pb-2 border-b flex-row items-center justify-between px-3 pt-3">
                  <CardTitle className="text-sm truncate">
                    Chat with {(sessionUsers as any)[activeSessions.find((s: any) => s.id === activeChat)?.user_id] || "User"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs shrink-0" onClick={() => endChat.mutate(activeChat)}>
                    <PhoneOff className="w-3 h-3 mr-1" /> End
                  </Button>
                </CardHeader>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2">
                    {chatMessages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[80%] rounded-xl px-3 py-2 text-sm",
                            isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          )}>
                            <p className="break-words text-sm">{msg.content}</p>
                            <p className={cn("text-[10px] mt-0.5", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {format(new Date(msg.created_at), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {shortcuts.length > 0 && (
                  <div className="px-3 pb-1 flex flex-wrap gap-1">
                    {shortcuts.slice(0, 6).map(s => (
                      <button key={s.id} onClick={() => sendMessage(s.message)}
                        className="text-[10px] bg-muted hover:bg-primary/10 px-2 py-0.5 rounded-full border border-border transition-colors">
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="Type a reply..." value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 h-9" />
                    <Button size="icon" className="h-9 w-9" onClick={() => sendMessage()} disabled={!chatInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Select a chat to start</p>
                  <p className="text-xs mt-1">Active chats appear on the left</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentChatsPage;

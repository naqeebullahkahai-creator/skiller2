import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, MessageSquare, Clock, Users, Eye, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const AdminAgentOnlineMonitor = () => {
  const queryClient = useQueryClient();
  const [historyDialog, setHistoryDialog] = useState<{ agentId: string; agentName: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-agent-online-monitor"],
    queryFn: async () => {
      const { data: agentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "support_agent" as any);

      if (!agentRoles?.length) return { agents: [] };

      const agentIds = agentRoles.map(r => r.user_id);

      const [{ data: profiles }, { data: onlineStatus }, { data: activeSessions }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", agentIds),
        supabase.from("agent_online_status").select("*").in("user_id", agentIds),
        supabase.from("support_chat_sessions").select("*").in("agent_id", agentIds).eq("status", "active"),
      ]);

      const userIds = [...new Set((activeSessions || []).map((s: any) => s.user_id))];
      const { data: sessionUsers } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
        : { data: [] };

      const userMap: Record<string, string> = {};
      sessionUsers?.forEach((u: any) => { userMap[u.id] = u.full_name || "User"; });

      const agents = (profiles || []).map(p => {
        const status = onlineStatus?.find((o: any) => o.user_id === p.id);
        const chats = (activeSessions || []).filter((s: any) => s.agent_id === p.id);
        return {
          ...p,
          is_online: status?.is_online || false,
          last_seen_at: status?.last_seen_at,
          active_chats: chats.map((c: any) => ({
            session_id: c.id,
            user_id: c.user_id,
            user_name: userMap[c.user_id] || "User",
            subject: c.subject,
            started_at: c.started_at,
          })),
        };
      });

      return { agents };
    },
    refetchInterval: 10000,
  });

  // Chat history for a specific agent
  const { data: chatHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["agent-chat-history", historyDialog?.agentId],
    enabled: !!historyDialog,
    queryFn: async () => {
      if (!historyDialog) return [];
      const { data: sessions } = await supabase
        .from("support_chat_sessions")
        .select("*")
        .eq("agent_id", historyDialog.agentId)
        .in("status", ["ended", "active"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (!sessions?.length) return [];

      // Get user names
      const userIds = [...new Set(sessions.map((s: any) => s.user_id))];
      const { data: users } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const userMap: Record<string, string> = {};
      users?.forEach((u: any) => { userMap[u.id] = u.full_name || "User"; });

      // Get message counts per session
      const sessionIds = sessions.map((s: any) => s.id);
      const { data: messages } = await supabase
        .from("support_messages")
        .select("session_id")
        .in("session_id", sessionIds);

      const msgCounts: Record<string, number> = {};
      messages?.forEach((m: any) => {
        msgCounts[m.session_id] = (msgCounts[m.session_id] || 0) + 1;
      });

      return sessions.map((s: any) => ({
        ...s,
        user_name: userMap[s.user_id] || "User",
        message_count: msgCounts[s.id] || 0,
      }));
    },
  });

  // View messages for a specific session
  const [viewSessionId, setViewSessionId] = useState<string | null>(null);

  const { data: sessionMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["agent-session-messages", viewSessionId],
    enabled: !!viewSessionId,
    queryFn: async () => {
      if (!viewSessionId) return [];
      const { data } = await supabase
        .from("support_chat_messages")
        .select("*")
        .eq("session_id", viewSessionId)
        .order("created_at", { ascending: true });
      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-agent-monitor")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_online_status" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-agent-online-monitor"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "support_chat_sessions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-agent-online-monitor"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const agents = data?.agents || [];
  const onlineCount = agents.filter(a => a.is_online).length;
  const totalActiveChats = agents.reduce((sum, a) => sum + a.active_chats.length, 0);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" /> Agent Live Monitor
        </h1>
        <p className="text-sm text-muted-foreground">Real-time agent status, active conversations & chat history</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
          <p className="text-xs text-muted-foreground">Online Now</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{agents.length - onlineCount}</p>
          <p className="text-xs text-muted-foreground">Offline</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalActiveChats}</p>
          <p className="text-xs text-muted-foreground">Active Chats</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : agents.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No agents found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <Card key={agent.id} className={cn("border-l-4", agent.is_online ? "border-l-green-500" : "border-l-muted")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("text-sm", agent.is_online ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                      {agent.full_name?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{agent.full_name}</p>
                      <Badge variant={agent.is_online ? "default" : "secondary"} className={cn("text-xs gap-1", agent.is_online && "bg-green-500")}>
                        {agent.is_online ? <><CheckCircle size={10}/> Online</> : <><XCircle size={10}/> Offline</>}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                    {agent.last_seen_at && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={9}/> Last seen: {format(new Date(agent.last_seen_at), "MMM dd, HH:mm")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{agent.active_chats.length}</p>
                      <p className="text-[10px] text-muted-foreground">Active</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setHistoryDialog({ agentId: agent.id, agentName: agent.full_name })}
                    >
                      <History size={12}/> History
                    </Button>
                  </div>
                </div>

                {agent.active_chats.length > 0 && (
                  <div className="ml-13 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MessageSquare size={11}/> Currently chatting with:
                    </p>
                    {agent.active_chats.map((chat: any) => (
                      <div key={chat.session_id} className="flex items-center gap-2 pl-4 py-1 bg-muted/50 rounded text-xs">
                        <Users size={11} className="text-primary shrink-0"/>
                        <span className="font-medium">{chat.user_name}</span>
                        {chat.subject && <span className="text-muted-foreground">— {chat.subject}</span>}
                        {chat.started_at && <span className="text-muted-foreground ml-auto">{format(new Date(chat.started_at), "HH:mm")}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat History Dialog */}
      <Dialog open={!!historyDialog && !viewSessionId} onOpenChange={(o) => { if (!o) setHistoryDialog(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={16}/> Chat History — {historyDialog?.agentName}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {historyLoading ? (
              <div className="space-y-2 p-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full"/>)}</div>
            ) : chatHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No chat history</p>
            ) : (
              <div className="space-y-2 p-1">
                {chatHistory.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setViewSessionId(session.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{session.user_name}</p>
                        <Badge variant={session.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {session.status}
                        </Badge>
                      </div>
                      {session.subject && <p className="text-xs text-muted-foreground truncate">{session.subject}</p>}
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(session.created_at), "MMM dd, yyyy HH:mm")} · {session.message_count} messages
                        {session.rating && ` · ⭐ ${session.rating}`}
                      </p>
                    </div>
                    <MessageSquare size={14} className="text-muted-foreground shrink-0"/>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Messages Dialog */}
      <Dialog open={!!viewSessionId} onOpenChange={(o) => { if (!o) setViewSessionId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare size={16}/> Chat Messages
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {messagesLoading ? (
              <div className="space-y-2 p-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full"/>)}</div>
            ) : sessionMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages</p>
            ) : (
              <div className="space-y-2 p-1">
                {sessionMessages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-2 rounded-lg text-sm max-w-[85%]",
                      msg.sender_type === "agent"
                        ? "bg-primary/10 ml-auto text-right"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">
                      {msg.sender_type === "agent" ? "Agent" : "User"} · {format(new Date(msg.created_at), "HH:mm")}
                    </p>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <Button variant="outline" size="sm" onClick={() => setViewSessionId(null)}>
            ← Back to History
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentOnlineMonitor;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, MessageSquare, Clock, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const AdminAgentOnlineMonitor = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-agent-online-monitor"],
    queryFn: async () => {
      // Get support agents
      const { data: agentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "support_agent" as any);

      if (!agentRoles?.length) return { agents: [], activeSessions: [] };

      const agentIds = agentRoles.map(r => r.user_id);

      const [{ data: profiles }, { data: onlineStatus }, { data: activeSessions }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").in("id", agentIds),
        supabase.from("agent_online_status").select("*").in("user_id", agentIds),
        supabase.from("support_chat_sessions").select("*").in("agent_id", agentIds).eq("status", "active"),
      ]);

      // Get user names for active sessions
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

  // Realtime updates
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
        <p className="text-sm text-muted-foreground">Real-time agent status & active conversations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
          <p className="text-xs text-muted-foreground">Online Now</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{agents.length - onlineCount}</p>
          <p className="text-xs text-muted-foreground">Offline</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalActiveChats}</p>
          <p className="text-xs text-muted-foreground">Active Chats</p>
        </CardContent></Card>
      </div>

      {/* Agent Cards */}
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
                  <div className="text-center shrink-0">
                    <p className="text-lg font-bold text-primary">{agent.active_chats.length}</p>
                    <p className="text-[10px] text-muted-foreground">Active Chats</p>
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
    </div>
  );
};

export default AdminAgentOnlineMonitor;

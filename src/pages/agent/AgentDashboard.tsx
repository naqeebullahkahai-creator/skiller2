import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Headphones, MessageSquare, Star, Clock, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const AgentDashboard = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  // Fetch agent profile
  const { data: agentProfile } = useQuery({
    queryKey: ["agent-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("support_agent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch active support sessions
  const { data: activeSessions = [] } = useQuery({
    queryKey: ["agent-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("support_chat_sessions")
        .select("*")
        .eq("agent_id", user.id)
        .in("status", ["active", "waiting"])
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Fetch waiting sessions (unassigned)
  const { data: waitingSessions = [] } = useQuery({
    queryKey: ["waiting-sessions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_chat_sessions")
        .select("*")
        .eq("status", "waiting")
        .is("agent_id", null)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user && isOnline,
    refetchInterval: 5000,
  });

  // Fetch today's stats
  const { data: todayStats } = useQuery({
    queryKey: ["agent-today-stats", user?.id],
    queryFn: async () => {
      if (!user) return { resolved: 0, avgRating: 0 };
      const today = new Date().toISOString().split("T")[0];
      const { data: sessions } = await supabase
        .from("support_chat_sessions")
        .select("rating")
        .eq("agent_id", user.id)
        .eq("status", "ended")
        .gte("created_at", today);
      
      const resolved = sessions?.length || 0;
      const rated = sessions?.filter((s) => s.rating) || [];
      const avgRating = rated.length > 0
        ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length
        : 0;
      return { resolved, avgRating };
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (agentProfile) {
      setIsOnline(agentProfile.is_online);
    }
  }, [agentProfile]);

  const toggleOnline = useMutation({
    mutationFn: async (online: boolean) => {
      if (!user) throw new Error("Not authenticated");
      // Update agent profile
      await supabase
        .from("support_agent_profiles")
        .update({ is_online: online, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      // Also update agent_online_status table
      await supabase
        .from("agent_online_status")
        .upsert({ user_id: user.id, is_online: online, last_seen_at: new Date().toISOString() });
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
      const { error } = await supabase
        .from("support_chat_sessions")
        .update({ agent_id: user.id, status: "active", started_at: new Date().toISOString() })
        .eq("id", sessionId)
        .is("agent_id", null);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Session claimed!");
      queryClient.invalidateQueries({ queryKey: ["agent-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-sessions"] });
    },
    onError: () => toast.error("Could not claim session - may have been taken"),
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="h-6 w-6 text-primary" />
            Support Agent Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome, {profile?.full_name || "Agent"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {isOnline ? "Online" : "Offline"}
          </span>
          <Switch
            checked={isOnline}
            onCheckedChange={(checked) => toggleOnline.mutate(checked)}
          />
          <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-green-500" : ""}>
            {isOnline ? "🟢 Active" : "⚪ Away"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
                <p className="text-xs text-muted-foreground">Active Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{waitingSessions.length}</p>
                <p className="text-xs text-muted-foreground">Waiting Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{todayStats?.resolved || 0}</p>
                <p className="text-xs text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{todayStats?.avgRating?.toFixed(1) || "0.0"}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Queue */}
      {isOnline && waitingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Waiting Queue ({waitingSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {waitingSessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{session.subject || "General Support"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => claimSession.mutate(session.id)}
                  disabled={claimSession.isPending}
                >
                  Accept
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isOnline ? "No active sessions. Waiting for customers..." : "Go online to start receiving chats."}
            </p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{session.subject || "General Support"}</p>
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(session.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;

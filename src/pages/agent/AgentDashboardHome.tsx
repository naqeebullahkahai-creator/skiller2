import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, MessageSquare, Star, CheckCircle, Users, DollarSign, BarChart3, Settings } from "lucide-react";
import { toast } from "sonner";

const AgentDashboardHome = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: todayStats } = useQuery({
    queryKey: ["agent-today-stats", user?.id],
    queryFn: async () => {
      if (!user) return { resolved: 0, avgRating: 0, totalSessions: 0, activeCount: 0, waitingCount: 0 };
      const today = new Date().toISOString().split("T")[0];
      const { data: sessions } = await supabase.from("support_chat_sessions").select("rating, status").eq("agent_id", user.id).gte("created_at", today);
      const { count: activeCount } = await supabase.from("support_chat_sessions").select("*", { count: "exact", head: true }).eq("agent_id", user.id).eq("status", "active");
      const { count: waitingCount } = await supabase.from("support_chat_sessions").select("*", { count: "exact", head: true }).eq("status", "waiting").is("agent_id", null);
      const all = sessions || [];
      const resolved = all.filter(s => s.status === "ended").length;
      const rated = all.filter(s => s.rating);
      const avgRating = rated.length > 0 ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length : 0;
      return { resolved, avgRating, totalSessions: all.length, activeCount: activeCount || 0, waitingCount: waitingCount || 0 };
    },
    enabled: !!user,
  });

  // Realtime: listen for new waiting sessions
  useEffect(() => {
    const channel = supabase
      .channel("agent-home-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_chat_sessions" }, (payload) => {
        if ((payload.new as any).status === "waiting") {
          toast.info("🆘 New support request in queue!", { duration: 5000 });
          queryClient.invalidateQueries({ queryKey: ["agent-today-stats"] });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_chat_sessions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["agent-today-stats"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const stats = [
    { icon: <MessageSquare className="h-5 w-5 text-primary" />, val: todayStats?.activeCount || 0, label: "Active Chats" },
    { icon: <Users className="h-5 w-5 text-orange-500" />, val: todayStats?.waitingCount || 0, label: "In Queue" },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, val: todayStats?.resolved || 0, label: "Resolved Today" },
    { icon: <Star className="h-5 w-5 text-yellow-500" />, val: todayStats?.avgRating?.toFixed(1) || "0.0", label: "Avg Rating" },
  ];

  const quickActions = [
    { icon: <MessageSquare className="h-5 w-5" />, label: "Live Chats", path: "/agent/chats", color: "text-primary" },
    { icon: <DollarSign className="h-5 w-5" />, label: "Earnings", path: "/agent/earnings", color: "text-green-500" },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Performance", path: "/agent/performance", color: "text-blue-500" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", path: "/agent/settings", color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-4 overflow-x-hidden">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <Headphones className="h-5 w-5" />
          <h1 className="text-lg font-bold">Agent Dashboard</h1>
        </div>
        <p className="text-xs opacity-80">Welcome back, {profile?.full_name || "Agent"}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-bold">{s.val}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-1.5"
              onClick={() => navigate(action.path)}
            >
              <span className={action.color}>{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboardHome;

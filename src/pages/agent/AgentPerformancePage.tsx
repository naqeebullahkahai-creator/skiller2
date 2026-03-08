import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Star, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const AgentPerformancePage = () => {
  const { user } = useAuth();

  const { data: performance = [] } = useQuery({
    queryKey: ["agent-performance-full", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("agent_performance")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: allTimeSessions } = useQuery({
    queryKey: ["agent-alltime-sessions", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, resolved: 0 };
      const { count: total } = await supabase.from("support_chat_sessions").select("*", { count: "exact", head: true }).eq("agent_id", user.id);
      const { count: resolved } = await supabase.from("support_chat_sessions").select("*", { count: "exact", head: true }).eq("agent_id", user.id).eq("status", "ended");
      return { total: total || 0, resolved: resolved || 0 };
    },
    enabled: !!user,
  });

  const totalRated = performance.filter(p => p.rating).length;
  const avgRating = totalRated > 0
    ? (performance.filter(p => p.rating).reduce((sum, p) => sum + (p.rating || 0), 0) / totalRated).toFixed(1)
    : "0.0";
  const avgDuration = performance.length > 0
    ? (performance.reduce((sum, p) => sum + (p.session_duration_minutes || 0), 0) / performance.length).toFixed(1)
    : "0";

  const stats = [
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, val: allTimeSessions?.resolved || 0, label: "Total Resolved" },
    { icon: <Star className="h-5 w-5 text-yellow-500" />, val: avgRating, label: "Avg Rating" },
    { icon: <Clock className="h-5 w-5 text-blue-500" />, val: `${avgDuration}m`, label: "Avg Duration" },
    { icon: <TrendingUp className="h-5 w-5 text-primary" />, val: totalRated, label: "Ratings Received" },
  ];

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-lg font-bold">Performance</h1>
        </div>
        <p className="text-xs opacity-80">Your support metrics and feedback</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-xl font-bold">{s.val}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {performance.filter(p => p.rating).length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-xs">No feedback yet</p>
          ) : (
            performance.filter(p => p.rating).slice(0, 30).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">⭐ {p.rating}</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</span>
                  </div>
                  {p.feedback_text && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.feedback_text}</p>}
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{p.session_duration_minutes?.toFixed(0) || "?"} min</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentPerformancePage;

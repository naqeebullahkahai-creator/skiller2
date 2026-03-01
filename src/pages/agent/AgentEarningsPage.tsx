import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, Wallet } from "lucide-react";
import { format } from "date-fns";

const AgentEarningsPage = () => {
  const { user } = useAuth();

  const { data: performance = [] } = useQuery({
    queryKey: ["agent-performance-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("agent_performance")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user,
  });

  const totalSessions = performance.length;
  const avgDuration = totalSessions > 0
    ? (performance.reduce((sum, p) => sum + (p.session_duration_minutes || 0), 0) / totalSessions).toFixed(1)
    : "0";

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-5 w-5" />
          <h1 className="text-lg font-bold">Earnings & Salary</h1>
        </div>
        <p className="text-xs opacity-80">Track your income and work hours</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <Wallet className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalSessions}</p>
            <p className="text-[10px] text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{avgDuration}</p>
            <p className="text-[10px] text-muted-foreground">Avg Min/Session</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">—</p>
            <p className="text-[10px] text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <DollarSign className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl font-bold">—</p>
            <p className="text-[10px] text-muted-foreground">Withdrawals</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {performance.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-xs">No sessions recorded yet</p>
          ) : (
            performance.slice(0, 20).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-5">{p.session_duration_minutes?.toFixed(0) || "?"} min</Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</span>
                  </div>
                  {p.feedback_text && <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.feedback_text}</p>}
                </div>
                {p.rating && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs shrink-0">⭐ {p.rating}</Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentEarningsPage;

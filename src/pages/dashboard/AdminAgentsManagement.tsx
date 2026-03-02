import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Headphones, Search, Users, CheckCircle, XCircle, Star,
  MessageSquare, ChevronRight, Shield, Clock, BarChart3, ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";

interface AgentData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  is_online: boolean;
  total_sessions: number;
  resolved_sessions: number;
  avg_rating: number;
  last_seen_at: string | null;
  created_at: string;
}

const useAdminAgents = (searchQuery?: string) => {
  return useQuery({
    queryKey: ["admin-agents", searchQuery],
    queryFn: async () => {
      // Get all users with support_agent role
      const { data: agentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "support_agent" as any);

      if (!agentRoles || agentRoles.length === 0) return { agents: [], stats: { total: 0, online: 0, avgRating: 0, totalResolved: 0 } };

      const agentIds = agentRoles.map(r => r.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .in("id", agentIds)
        .neq("email", SUPER_ADMIN_EMAIL);

      // Get online status
      const { data: onlineStatus } = await supabase
        .from("agent_online_status")
        .select("user_id, is_online, last_seen_at")
        .in("user_id", agentIds);

      // Get sessions data
      const { data: sessions } = await supabase
        .from("support_chat_sessions")
        .select("agent_id, status, rating")
        .in("agent_id", agentIds);

      const agents: AgentData[] = (profiles || []).map(p => {
        const online = onlineStatus?.find(o => o.user_id === p.id);
        const agentSessions = sessions?.filter(s => s.agent_id === p.id) || [];
        const resolved = agentSessions.filter(s => s.status === "ended");
        const rated = resolved.filter(s => s.rating);
        const avgRating = rated.length > 0 ? rated.reduce((sum, s) => sum + (s.rating || 0), 0) / rated.length : 0;

        return {
          id: p.id,
          user_id: p.id,
          full_name: p.full_name || "Agent",
          email: p.email || "",
          is_online: online?.is_online || false,
          total_sessions: agentSessions.length,
          resolved_sessions: resolved.length,
          avg_rating: avgRating,
          last_seen_at: online?.last_seen_at || null,
          created_at: p.created_at,
        };
      });

      // Search filter
      let filtered = agents;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = agents.filter(a => a.full_name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
      }

      const onlineCount = filtered.filter(a => a.is_online).length;
      const totalResolved = filtered.reduce((sum, a) => sum + a.resolved_sessions, 0);
      const allRated = filtered.filter(a => a.avg_rating > 0);
      const overallRating = allRated.length > 0 ? allRated.reduce((sum, a) => sum + a.avg_rating, 0) / allRated.length : 0;

      return {
        agents: filtered,
        stats: { total: filtered.length, online: onlineCount, avgRating: overallRating, totalResolved },
      };
    },
  });
};

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: number;
  color: string;
}

const QuickAction = ({ icon, title, description, href, badge, color }: QuickActionProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={() => navigate(href)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {badge && badge > 0 ? <Badge variant="destructive" className="text-xs">{badge}</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};

const AdminAgentsManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading } = useAdminAgents(searchQuery);
  const agents = data?.agents || [];
  const stats = data?.stats || { total: 0, online: 0, avgRating: 0, totalResolved: 0 };

  const statCards = [
    { label: "Total Agents", value: stats.total, icon: <Headphones className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
    { label: "Online Now", value: stats.online, icon: <CheckCircle className="h-5 w-5 text-white" />, color: "bg-green-500" },
    { label: "Avg Rating", value: stats.avgRating.toFixed(1) + " ★", icon: <Star className="h-5 w-5 text-white" />, color: "bg-yellow-500" },
    { label: "Total Resolved", value: stats.totalResolved, icon: <MessageSquare className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <Shield className="w-5 h-5 text-white" />, title: "Roles & Permissions", description: "Assign support_agent role", href: "/admin/roles", color: "bg-slate-700" },
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: "Chat Shortcuts", description: "Manage quick replies", href: "/admin/chat-shortcuts", color: "bg-primary" },
    { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Analytics", description: "Support performance data", href: "/admin/analytics", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Headphones className="h-6 w-6" />
          Agents Management
        </h1>
        <p className="text-white/80 text-sm mt-1">Support agent overview, performance metrics & chat management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl shrink-0", card.color)}>{card.icon}</div>
              <div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="overview">Quick Actions</TabsTrigger>
          <TabsTrigger value="directory">Agent Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => <QuickAction key={i} {...action} />)}
          </div>
        </TabsContent>

        <TabsContent value="directory" className="mt-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Sessions</TableHead>
                    <TableHead className="hidden md:table-cell">Resolved</TableHead>
                    <TableHead className="hidden lg:table-cell">Avg Rating</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No agents found. Assign the "support_agent" role via Roles & Permissions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">{agent.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{agent.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{agent.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.is_online ? "default" : "secondary"} className={cn("gap-1", agent.is_online && "bg-green-500")}>
                            {agent.is_online ? <><CheckCircle size={10} /> Online</> : <><XCircle size={10} /> Offline</>}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{agent.total_sessions}</TableCell>
                        <TableCell className="hidden md:table-cell">{agent.resolved_sessions}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm">{agent.avg_rating > 0 ? agent.avg_rating.toFixed(1) : "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {agent.last_seen_at ? format(new Date(agent.last_seen_at), "MMM dd, HH:mm") : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAgentsManagement;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, ShieldAlert, Lock, Users, ChevronRight, Key, BarChart3, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: React.ReactNode; title: string; description: string; href: string; badge?: number; color: string;
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

const AdminSecurityManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const statCards = [
    { label: "Security", value: "Active", icon: <ShieldAlert className="h-5 w-5 text-white" />, color: "bg-red-500" },
    { label: "Staff Roles", value: "—", icon: <Users className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
    { label: "Audit Logs", value: "—", icon: <Lock className="h-5 w-5 text-white" />, color: "bg-slate-500" },
    { label: "Permissions", value: "Active", icon: <Key className="h-5 w-5 text-white" />, color: "bg-amber-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <ShieldAlert className="w-5 h-5 text-white" />, title: "Security & Logins", description: "Login sessions, blocked IPs, audit logs", href: "/admin/security", color: "bg-red-500" },
    { icon: <Shield className="w-5 h-5 text-white" />, title: "Roles & Permissions", description: "Staff roles & feature access", href: "/admin/roles", color: "bg-indigo-500" },
    { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Platform Analytics", description: "Revenue & performance insights", href: "/admin/analytics", color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-red-700 to-red-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Security & Access</h1>
        <p className="text-white/80 text-sm mt-1">Logins, roles, permissions & audit logs</p>
      </div>

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
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Lock className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">View security audit logs</p>
              <p className="text-sm mt-1">Click "Security & Logins" for full audit trail</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurityManagement;

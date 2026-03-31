import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";
import { Headphones, Shield, Activity, Wallet, DollarSign, MessageSquare, ChevronRight } from "lucide-react";

const AgentModuleHome = () => {
  const navigate = useNavigate();
  const counts = useAdminSidebarCounts();

  const stats = [
    { label: "Pending Payouts", value: counts.pendingPayouts, color: "text-violet-600" },
  ];

  const quickLinks = [
    { title: "Assign Roles", desc: "Assign agent roles", icon: Shield, href: "/admin/module/agents/roles", color: "bg-violet-100 dark:bg-violet-900/30" },
    { title: "Live Monitor", desc: "Online agents", icon: Activity, href: "/admin/module/agents/monitor", color: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Salaries", desc: "Manage salaries", icon: DollarSign, href: "/admin/module/agents/salaries", color: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Payouts", desc: "Process payouts", icon: Wallet, href: "/admin/module/agents/payouts", badge: counts.pendingPayouts, color: "bg-blue-100 dark:bg-blue-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agent Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage support agents and operations</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quickLinks.map((link, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] border-0 shadow-sm" onClick={() => navigate(link.href)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl", link.color)}>
                <link.icon size={20} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{link.title}</h3>
                  {link.badge ? <Badge variant="destructive" className="text-xs">{link.badge}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{link.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentModuleHome;

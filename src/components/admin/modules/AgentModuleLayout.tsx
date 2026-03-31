import { Headphones, Users, Shield, Activity, Wallet, DollarSign, MessageSquare, Settings } from "lucide-react";
import AdminModuleLayout, { ModuleNavItem } from "./AdminModuleLayout";
import { useAdminSidebarCounts } from "@/hooks/useAdminSidebarCounts";

const AgentModuleLayout = () => {
  const counts = useAdminSidebarCounts();

  const navItems: ModuleNavItem[] = [
    { name: "Overview", href: "/admin/module/agents", icon: Headphones },
    { name: "Assign Roles", href: "/admin/module/agents/roles", icon: Shield },
    { name: "Live Monitor", href: "/admin/module/agents/monitor", icon: Activity },
    { name: "Salaries", href: "/admin/module/agents/salaries", icon: DollarSign },
    { name: "Payouts", href: "/admin/module/agents/payouts", icon: Wallet, badge: counts.pendingPayouts },
    { name: "Chat Sessions", href: "/admin/module/agents/chats", icon: MessageSquare },
  ];

  return (
    <AdminModuleLayout
      title="Agent Management"
      icon={Headphones}
      color="bg-violet-600"
      backHref="/admin/dashboard"
      navItems={navItems}
    />
  );
};

export default AgentModuleLayout;

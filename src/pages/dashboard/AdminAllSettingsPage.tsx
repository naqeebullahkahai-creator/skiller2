import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  CreditCard,
  Wrench,
  Palette,
  Facebook,
  Settings2,
  Megaphone,
  ChevronRight,
  ShieldCheck,
  Users,
  Receipt,
} from "lucide-react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const settingsPages = [
  {
    title: "Social Media & Contact",
    description: "Manage social links, contact info, and site domain",
    icon: Facebook,
    href: "/admin/site-settings",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Payment Settings",
    description: "Payment methods, COD-only mode, manual deposits",
    icon: CreditCard,
    href: "/admin/payment-settings",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Maintenance Mode",
    description: "Schedule maintenance with timer and access control",
    icon: Wrench,
    href: "/admin/settings",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    badge: "maintenance",
  },
  {
    title: "Brand Assets",
    description: "Logo, favicon, and branding configuration",
    icon: Palette,
    href: "/admin/brand-assets",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Commission & Fees",
    description: "Seller commission rates and per-order fees",
    icon: Receipt,
    href: "/admin/commission-management",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Subscription Plans",
    description: "Seller billing plans and grace periods",
    icon: Settings2,
    href: "/admin/subscriptions",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Roles & Permissions",
    description: "Staff roles, agents, and access control",
    icon: ShieldCheck,
    href: "/admin/roles",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "User Directory",
    description: "Manage customers and their accounts",
    icon: Users,
    href: "/admin/users",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Chat Shortcuts",
    description: "Quick reply templates for support",
    icon: Megaphone,
    href: "/admin/chat-shortcuts",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

const AdminAllSettingsPage = () => {
  const { isMaintenanceMode } = useMaintenanceMode();
  const { settings } = useSiteSettings();
  const codOnly = settings?.find(s => s.setting_key === 'cod_only_mode')?.setting_value === 'true';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" />
          All Settings
        </h1>
        <p className="text-muted-foreground">
          Manage all platform settings from one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsPages.map((page) => (
          <Link key={page.href} to={page.href}>
            <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${page.bgColor}`}>
                    <page.icon className={`w-5 h-5 ${page.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {page.badge === "maintenance" && isMaintenanceMode && (
                      <Badge variant="destructive" className="text-xs">ACTIVE</Badge>
                    )}
                    {page.title === "Payment Settings" && codOnly && (
                      <Badge variant="destructive" className="text-xs">COD ONLY</Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{page.title}</CardTitle>
                <CardDescription className="text-xs">{page.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminAllSettingsPage;

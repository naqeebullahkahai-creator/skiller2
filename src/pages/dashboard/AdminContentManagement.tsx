import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Star, MessageSquare, Globe, Image, Settings, Bell, Headphones,
  ChevronRight, BookOpen, Settings2, ArrowLeft
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

const AdminContentManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const statCards = [
    { label: "Reviews", value: "—", icon: <Star className="h-5 w-5 text-white" />, color: "bg-amber-500" },
    { label: "Q&A", value: "—", icon: <MessageSquare className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Notifications", value: "—", icon: <Bell className="h-5 w-5 text-white" />, color: "bg-rose-500" },
    { label: "Settings", value: "Active", icon: <Settings className="h-5 w-5 text-white" />, color: "bg-slate-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <Star className="w-5 h-5 text-white" />, title: "Reviews", description: "Moderate product reviews", href: "/admin/reviews", color: "bg-amber-500" },
    { icon: <MessageSquare className="w-5 h-5 text-white" />, title: "Q&A Moderation", description: "Product questions & answers", href: "/admin/qa", color: "bg-blue-500" },
    { icon: <Globe className="w-5 h-5 text-white" />, title: "Site Settings", description: "Social links & contact info", href: "/admin/site-settings", color: "bg-cyan-500" },
    { icon: <FileText className="w-5 h-5 text-white" />, title: "Content Manager", description: "Site pages & content", href: "/admin/content-manager", color: "bg-teal-500" },
    { icon: <Image className="w-5 h-5 text-white" />, title: "Brand Assets", description: "Logo, colors & branding", href: "/admin/brand-assets", color: "bg-pink-500" },
    { icon: <Headphones className="w-5 h-5 text-white" />, title: "Chat Shortcuts", description: "Quick reply templates", href: "/admin/chat-shortcuts", color: "bg-violet-500" },
    { icon: <Bell className="w-5 h-5 text-white" />, title: "Send Notification", description: "Push notifications to users", href: "/admin/notifications", color: "bg-rose-500" },
    { icon: <Settings2 className="w-5 h-5 text-white" />, title: "All Settings", description: "Complete settings overview", href: "/admin/all-settings", color: "bg-gray-500" },
    { icon: <Settings className="w-5 h-5 text-white" />, title: "Platform Settings", description: "Maintenance & configuration", href: "/admin/settings", color: "bg-slate-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> Content & Settings</h1>
        <p className="text-white/80 text-sm mt-1">Reviews, Q&A, notifications, site settings & branding</p>
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
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Manage site content from Content Manager</p>
              <p className="text-sm mt-1">Click "Content Manager" to edit pages & content</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManagement;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Image, Megaphone, ChevronRight, Ticket, TrendingUp
} from "lucide-react";
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

const AdminMarketingManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const statCards = [
    { label: "Flash Sales", value: "—", icon: <Zap className="h-5 w-5 text-white" />, color: "bg-yellow-500" },
    { label: "Campaigns", value: "—", icon: <Megaphone className="h-5 w-5 text-white" />, color: "bg-rose-500" },
    { label: "Vouchers", value: "—", icon: <Ticket className="h-5 w-5 text-white" />, color: "bg-purple-500" },
    { label: "Banners", value: "—", icon: <Image className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <Zap className="w-5 h-5 text-white" />, title: "Flash Sales", description: "Create & manage flash sale campaigns", href: "/admin/flash-sales", color: "bg-yellow-500" },
    { icon: <Zap className="w-5 h-5 text-white" />, title: "Flash Nominations", description: "Seller flash sale applications", href: "/admin/flash-nominations", color: "bg-orange-500" },
    { icon: <Ticket className="w-5 h-5 text-white" />, title: "Vouchers", description: "Discount codes & promotions", href: "/admin/vouchers", color: "bg-purple-500" },
    { icon: <Image className="w-5 h-5 text-white" />, title: "Banners", description: "Hero banners & carousel", href: "/admin/banners", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" /> Marketing & Promotions</h1>
        <p className="text-white/80 text-sm mt-1">Flash sales, vouchers, banners & campaigns</p>
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
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Campaign management available in Flash Sales</p>
              <p className="text-sm mt-1">Click "Flash Sales" to manage active campaigns</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMarketingManagement;

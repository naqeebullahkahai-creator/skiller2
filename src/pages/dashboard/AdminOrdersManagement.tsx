import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, ClipboardList, Store, Users, XCircle, RotateCcw,
  ChevronRight, Package, Truck, Clock, ArrowLeft
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

const AdminOrdersManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const statCards = [
    { label: "Total Orders", value: "—", icon: <ShoppingCart className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Pending", value: "—", icon: <Clock className="h-5 w-5 text-white" />, color: "bg-amber-500" },
    { label: "Shipped", value: "—", icon: <Truck className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { label: "Cancelled", value: "—", icon: <XCircle className="h-5 w-5 text-white" />, color: "bg-red-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <ClipboardList className="w-5 h-5 text-white" />, title: "All Orders", description: "View & manage all platform orders", href: "/admin/orders", color: "bg-blue-500" },
    { icon: <Store className="w-5 h-5 text-white" />, title: "Direct Store Orders", description: "Admin's own product sales", href: "/admin/orders/direct", color: "bg-emerald-500" },
    { icon: <Users className="w-5 h-5 text-white" />, title: "Vendor Marketplace Orders", description: "Seller marketplace orders", href: "/admin/orders/vendor", color: "bg-amber-500" },
    { icon: <XCircle className="w-5 h-5 text-white" />, title: "Cancellations", description: "Cancelled orders & refunds", href: "/admin/cancellations", color: "bg-red-500" },
    { icon: <RotateCcw className="w-5 h-5 text-white" />, title: "Returns", description: "Handle return requests", href: "/admin/returns", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Orders Management</h1>
        <p className="text-white/80 text-sm mt-1">Track, manage & fulfill all platform orders</p>
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
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">View recent orders from the All Orders section</p>
              <p className="text-sm mt-1">Click "All Orders" above to see the full order management interface</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOrdersManagement;

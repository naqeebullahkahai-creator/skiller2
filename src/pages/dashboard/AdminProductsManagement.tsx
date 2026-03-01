import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, FolderOpen, CheckCircle, Upload, ChevronRight, Tag, Layers
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

const AdminProductsManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const statCards = [
    { label: "Total Products", value: "—", icon: <Package className="h-5 w-5 text-white" />, color: "bg-teal-500" },
    { label: "Pending Approval", value: "—", icon: <CheckCircle className="h-5 w-5 text-white" />, color: "bg-amber-500" },
    { label: "Categories", value: "—", icon: <FolderOpen className="h-5 w-5 text-white" />, color: "bg-indigo-500" },
    { label: "Active", value: "—", icon: <Tag className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <Package className="w-5 h-5 text-white" />, title: "Product Catalog", description: "Browse & manage all products", href: "/admin/products", color: "bg-teal-500" },
    { icon: <FolderOpen className="w-5 h-5 text-white" />, title: "Category Manager", description: "Organize product categories", href: "/admin/categories", color: "bg-indigo-500" },
    { icon: <CheckCircle className="w-5 h-5 text-white" />, title: "Product Approvals", description: "Review pending products", href: "/admin/approvals", color: "bg-amber-500" },
    { icon: <Upload className="w-5 h-5 text-white" />, title: "Bulk Upload Logs", description: "View bulk upload history", href: "/admin/bulk-uploads", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Products & Catalog</h1>
        <p className="text-white/80 text-sm mt-1">Manage products, categories, approvals & bulk uploads</p>
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
          <TabsTrigger value="directory">Product Directory</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => <QuickAction key={i} {...a} />)}
          </div>
        </TabsContent>
        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Full product directory available in Product Catalog</p>
              <p className="text-sm mt-1">Click "Product Catalog" above to browse all products</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductsManagement;

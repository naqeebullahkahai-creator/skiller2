import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Package, ShoppingCart, Wallet, Settings, ArrowLeft,
  ChevronRight, Edit, Plus, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/hooks/useAdminStore";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminStorePage = () => {
  const navigate = useNavigate();
  const {
    storeSettings, storeWallet, transactions, adminProducts,
    updateSettings, isLoading,
  } = useAdminStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  const handleEditSave = () => {
    if (editMode && (storeName || storeDesc)) {
      updateSettings.mutate({
        ...(storeName ? { store_name: storeName } : {}),
        ...(storeDesc ? { store_description: storeDesc } : {}),
      });
    }
    if (!editMode) {
      setStoreName(storeSettings?.store_name || "");
      setStoreDesc(storeSettings?.store_description || "");
    }
    setEditMode(!editMode);
  };

  const statCards = [
    { label: "Store Balance", value: storeWallet ? formatPKR(storeWallet.total_balance) : "—", icon: <Wallet className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { label: "Total Earnings", value: storeWallet ? formatPKR(storeWallet.total_earnings) : "—", icon: <Store className="h-5 w-5 text-white" />, color: "bg-violet-500" },
    { label: "Total Orders", value: storeWallet?.total_orders ?? 0, icon: <ShoppingCart className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Products", value: adminProducts?.length ?? 0, icon: <Package className="h-5 w-5 text-white" />, color: "bg-amber-500" },
  ];

  const quickActions = [
    { icon: <Package className="w-5 h-5 text-white" />, title: "My Products", description: "Manage admin store products", href: "/admin/store/products", color: "bg-violet-500" },
    { icon: <Wallet className="w-5 h-5 text-white" />, title: "Store Wallet", description: "Earnings & transaction history", href: "/admin/store/wallet", color: "bg-emerald-500" },
    { icon: <ShoppingCart className="w-5 h-5 text-white" />, title: "Store Orders", description: "Orders for admin products", href: "/admin/store/orders", color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Store className="h-6 w-6" /> {storeSettings?.store_name || "Admin Store"}</h1>
            <p className="text-white/80 text-sm mt-1">Your personal marketplace store</p>
          </div>
          <Badge className={cn("text-xs", storeSettings?.is_active ? "bg-white/20 text-white" : "bg-red-500/80 text-white")}>
            {storeSettings?.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl shrink-0", card.color)}>{card.icon}</div>
              <div>
                {isLoading ? <Skeleton className="h-6 w-16" /> : <p className="text-lg font-bold">{card.value}</p>}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Quick Actions</TabsTrigger>
          <TabsTrigger value="settings">Store Settings</TabsTrigger>
          <TabsTrigger value="recent">Recent Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((a, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={() => navigate(a.href)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl shrink-0", a.color)}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Store Information</CardTitle>
              <Button variant="outline" size="sm" onClick={handleEditSave} className="gap-1.5">
                <Edit className="h-3.5 w-3.5" /> {editMode ? "Save" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                {editMode ? (
                  <Input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Store name" />
                ) : (
                  <p className="text-sm font-medium">{storeSettings?.store_name || "—"}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                {editMode ? (
                  <Textarea value={storeDesc} onChange={e => setStoreDesc(e.target.value)} placeholder="Store description" rows={3} />
                ) : (
                  <p className="text-sm text-muted-foreground">{storeSettings?.store_description || "No description"}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label>Store Active</Label>
                <Switch
                  checked={storeSettings?.is_active ?? true}
                  onCheckedChange={(checked) => updateSettings.mutate({ is_active: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {transactions && transactions.length > 0 ? (
                <div className="divide-y">
                  {transactions.slice(0, 20).map(txn => (
                    <div key={txn.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{txn.product_title || txn.description || "Sale"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                        +{formatPKR(txn.amount)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No sales yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStorePage;

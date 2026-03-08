import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/hooks/useAdminStore";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminStoreOrdersPage = () => {
  const navigate = useNavigate();
  const { adminOrders, ordersLoading } = useAdminStore();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/store")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Store Orders</h1>
        <p className="text-white/80 text-sm mt-1">Orders for your admin-owned products</p>
      </div>

      {ordersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : adminOrders && adminOrders.length > 0 ? (
        <div className="space-y-3">
          {adminOrders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{order.order_number || order.id.slice(0, 8)}</p>
                  <Badge className={cn("text-xs", statusColors[order.order_status] || "bg-muted")}>
                    {order.order_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="font-bold text-emerald-600">{formatPKR(order.total_amount_pkr)}</p>
                </div>
                {order.items && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    {Array.isArray(order.items) ? order.items.length : 0} item(s)
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Orders for admin products will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminStoreOrdersPage;

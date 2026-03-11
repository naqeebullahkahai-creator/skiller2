import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useAdminStore } from "@/hooks/useAdminStore";
import { cn } from "@/lib/utils";
import OrderStatusDropdown from "@/components/orders/OrderStatusDropdown";
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminStoreOrdersPage = () => {
  const navigate = useNavigate();
  const { adminOrders, ordersLoading, refetchOrders } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = (adminOrders || []).filter((order: any) => {
    const q = searchQuery.toLowerCase();
    return (order.order_number || "").toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      (order.customer_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/store")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Store Orders</h1>
        <p className="text-white/80 text-sm mt-1">Orders for your admin-owned products</p>
      </div>

      {/* Search & Refresh */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by order #, ID or customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchOrders?.()}>
            <RefreshCw className={cn("h-4 w-4 mr-2", ordersLoading && "animate-spin")} /> Refresh
          </Button>
        </CardContent>
      </Card>

      {ordersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filteredOrders.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Store Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || `#${order.id.slice(0, 8)}`}</TableCell>
                      <TableCell>{order.customer_name || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Package className="h-3.5 w-3.5" />
                          {Array.isArray(order.items) ? order.items.length : 0}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">{formatPKR(order.total_amount_pkr)}</TableCell>
                      <TableCell>
                        <OrderStatusDropdown
                          orderId={order.id}
                          orderNumber={order.order_number || `#${order.id.slice(0, 8)}`}
                          currentStatus={order.order_status}
                          paymentStatus={order.payment_status || "unpaid"}
                          totalAmount={order.total_amount_pkr}
                          role="admin"
                          onStatusChange={() => refetchOrders?.()}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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

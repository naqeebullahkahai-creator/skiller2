import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, ShoppingBag, Store, User } from "lucide-react";
import DateRangeFilter, { DateRange } from "@/components/admin/DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import OrderStatusDropdown from "@/components/orders/OrderStatusDropdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/hooks/useProducts";

const AdminSellerOrdersPage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });

  // Fetch orders with seller info
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-seller-orders"],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Only orders with seller products
      const sellerOrders = ordersData?.filter(o => {
        const items = o.items as any[];
        return items?.some(item => item.seller_id);
      }) || [];

      // Get unique seller IDs and customer IDs
      const sellerIds = new Set<string>();
      const customerIds = new Set<string>();
      sellerOrders.forEach(o => {
        customerIds.add(o.customer_id);
        const items = o.items as any[];
        items?.forEach(item => {
          if (item.seller_id) sellerIds.add(item.seller_id);
        });
      });

      // Fetch profiles for sellers and customers
      const allIds = [...Array.from(sellerIds), ...Array.from(customerIds)];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", allIds);

      // Fetch seller profiles for shop names
      const { data: sellerProfiles } = await supabase
        .from("seller_profiles")
        .select("user_id, shop_name")
        .in("user_id", Array.from(sellerIds));

      return sellerOrders.map(order => {
        const items = order.items as any[];
        const sellerItem = items?.find(i => i.seller_id);
        const sellerId = sellerItem?.seller_id;
        const sellerProfile = profiles?.find(p => p.id === sellerId);
        const sellerShop = sellerProfiles?.find(sp => sp.user_id === sellerId);
        const customerProfile = profiles?.find(p => p.id === order.customer_id);

        return {
          ...order,
          seller_name: sellerProfile?.full_name || "Unknown",
          seller_email: sellerProfile?.email || "-",
          seller_id: sellerId,
          seller_shop: sellerShop?.shop_name || "-",
          customer_name: customerProfile?.full_name || order.customer_name || "Unknown",
          customer_email: customerProfile?.email || "-",
          customer_id: order.customer_id,
        };
      });
    },
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("seller-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-seller-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const filteredOrders = orders
    .filter((order) => {
      const q = searchQuery.toLowerCase();
      return (order.order_number || "").toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.seller_name.toLowerCase().includes(q) ||
        order.seller_shop.toLowerCase().includes(q) ||
        order.seller_email.toLowerCase().includes(q) ||
        order.customer_email.toLowerCase().includes(q);
    })
    .filter((order) => statusFilter === "all" || order.order_status === statusFilter)
    .filter((order) => {
      if (!dateRange.from) return true;
      const d = new Date(order.created_at);
      return d >= dateRange.from && (!dateRange.to || d <= new Date(dateRange.to.getTime() + 86400000));
    });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount_pkr), 0);
  const deliveredCount = orders.filter(o => o.order_status === "delivered").length;
  const pendingCount = orders.filter(o => o.order_status === "pending" || o.order_status === "processing").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seller Orders</h1>
          <p className="text-muted-foreground">Orders for products from marketplace sellers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">{formatPKR(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground">{pendingCount} pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by order #, seller, customer, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Seller Orders ({filteredOrders.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1"><Store className="h-3.5 w-3.5" /> Seller</div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Customer</div>
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || `#${order.id.slice(0, 8)}`}</TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{order.seller_shop}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.seller_email}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{order.seller_id?.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.customer_email}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{order.customer_id?.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                      <TableCell className="font-medium">{formatPKR(order.total_amount_pkr)}</TableCell>
                      <TableCell>
                        <OrderStatusDropdown
                          orderId={order.id}
                          orderNumber={order.order_number || `#${order.id.slice(0, 8)}`}
                          currentStatus={order.order_status}
                          paymentStatus={order.payment_status}
                          totalAmount={order.total_amount_pkr}
                          role="admin"
                          onStatusChange={() => refetch()}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/account/orders/${order.id}`}>
                          <Button variant="ghost" size="sm"><Eye size={16} className="mr-1" /> View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="font-medium">No seller orders found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSellerOrdersPage;

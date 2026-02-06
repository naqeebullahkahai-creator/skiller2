import { useState } from "react";
import { MoreHorizontal, Search, RefreshCw, Printer, Eye, Truck, XCircle, Users } from "lucide-react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminOrderClassification } from "@/hooks/useAdminOrderClassification";
import { useOrderCancellation } from "@/hooks/useOrderCancellation";
import { formatPKR } from "@/hooks/useProducts";
import { generateOrderInvoice } from "@/utils/generateOrderInvoice";
import ShippingDialog from "@/components/orders/ShippingDialog";
import CancelOrderDialog from "@/components/orders/CancelOrderDialog";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/hooks/useOrders";

const AdminVendorOrdersPage = () => {
  const { vendorOrders, vendorRevenue, isLoading, refetch } = useAdminOrderClassification();
  const { canCancelOrder } = useOrderCancellation();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);

  const filteredOrders = vendorOrders
    .filter((order) => {
      const q = searchQuery.toLowerCase();
      return (order.order_number || "").toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q);
    })
    .filter((order) => statusFilter === "all" || order.order_status === statusFilter)
    .filter((order) => {
      if (!dateRange.from) return true;
      const d = new Date(order.created_at);
      return d >= dateRange.from && (!dateRange.to || d <= new Date(dateRange.to.getTime() + 86400000));
    });

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingInfo?: { tracking_id: string; courier_name: string }) => {
    const updateData: any = { order_status: newStatus };
    if (trackingInfo) {
      updateData.tracking_id = trackingInfo.tracking_id;
      updateData.courier_name = trackingInfo.courier_name;
    }
    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated", description: `Order status changed to ${newStatus}` });
      refetch();
    }
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    if (newStatus === "shipped") { setSelectedOrderForShipping(order); setShippingDialogOpen(true); return; }
    if (newStatus === "cancelled") { setSelectedOrderForCancel(order); setCancelDialogOpen(true); return; }
    updateOrderStatus(order.id, newStatus);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      processing: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || styles.pending;
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"], confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  const deliveredCount = vendorOrders.filter(o => o.order_status === 'delivered').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Marketplace Orders</h1>
          <p className="text-muted-foreground">Orders for products owned by third-party sellers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Commission Revenue</p>
            <p className="text-2xl font-bold text-amber-600">{formatPKR(vendorRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total vendor sales (commission earned from this)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{vendorOrders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-primary">{deliveredCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by FZN-ORD-, Order ID or Customer" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Vendor Orders ({filteredOrders.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-4"><Skeleton className="h-12 w-24" /><Skeleton className="h-12 flex-1" /><Skeleton className="h-12 w-24" /><Skeleton className="h-8 w-24" /></div>)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead>
                    <TableHead>Items</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number || `#${order.id.slice(0, 8)}`}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                      <TableCell className="text-sm">{order.items.length} items</TableCell>
                      <TableCell className="font-medium">{formatPKR(order.total_amount_pkr)}</TableCell>
                      <TableCell>
                        {getNextStatuses(order.order_status).length > 0 ? (
                          <Select value={order.order_status} onValueChange={(v) => handleStatusChange(order, v)}>
                            <SelectTrigger className="w-32 h-8"><Badge className={cn("capitalize", getStatusBadge(order.order_status))}>{order.order_status}</Badge></SelectTrigger>
                            <SelectContent>
                              <SelectItem value={order.order_status} disabled>{order.order_status} (current)</SelectItem>
                              {getNextStatuses(order.order_status).map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={cn("capitalize", getStatusBadge(order.order_status))}>{order.order_status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link to={`/account/orders/${order.id}`}><Eye className="h-4 w-4 mr-2" />View Details</Link></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => generateOrderInvoice({ id: order.id, order_number: order.order_number, customer_name: order.customer_name, customer_phone: order.customer_phone, shipping_address: order.shipping_address, payment_method: order.payment_method, total_amount_pkr: order.total_amount_pkr, order_status: order.order_status, items: order.items, created_at: order.created_at, tracking_id: order.tracking_id, courier_name: order.courier_name })}>
                              <Printer className="h-4 w-4 mr-2" />Print Invoice
                            </DropdownMenuItem>
                            {order.order_status === "processing" && (<><DropdownMenuSeparator /><DropdownMenuItem onClick={() => { setSelectedOrderForShipping(order); setShippingDialogOpen(true); }}><Truck className="h-4 w-4 mr-2" />Ship Order</DropdownMenuItem></>)}
                            {canCancelOrder(order.order_status).canCancel && (<><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedOrderForCancel(order); setCancelDialogOpen(true); }}><XCircle className="h-4 w-4 mr-2" />Cancel Order</DropdownMenuItem></>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32">
                        <div className="flex flex-col items-center justify-center text-center py-6">
                          <Users className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="font-medium text-foreground">No vendor orders found</p>
                          <p className="text-sm text-muted-foreground mt-1">Orders from third-party sellers will appear here.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrderForShipping && <ShippingDialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen} orderId={selectedOrderForShipping.id} orderNumber={selectedOrderForShipping.order_number || `#${selectedOrderForShipping.id.slice(0, 8)}`} onConfirm={async (tid, cn) => { await updateOrderStatus(selectedOrderForShipping.id, "shipped", { tracking_id: tid, courier_name: cn }); }} />}
      {selectedOrderForCancel && <CancelOrderDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen} orderId={selectedOrderForCancel.id} orderNumber={selectedOrderForCancel.order_number || `#${selectedOrderForCancel.id.slice(0, 8)}`} orderStatus={selectedOrderForCancel.order_status} paymentStatus={selectedOrderForCancel.payment_status} totalAmount={selectedOrderForCancel.total_amount_pkr} role="admin" onCancelled={() => refetch()} />}
    </div>
  );
};

export default AdminVendorOrdersPage;

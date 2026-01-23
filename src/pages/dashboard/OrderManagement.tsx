import { useState } from "react";
import { MoreHorizontal, Search, RefreshCw, Printer, Eye, Truck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/contexts/DashboardContext";
import { useOrders, Order } from "@/hooks/useOrders";
import { useOrderCancellation } from "@/hooks/useOrderCancellation";
import { formatPKR } from "@/hooks/useProducts";
import { generateOrderInvoice } from "@/utils/generateOrderInvoice";
import ShippingDialog from "@/components/orders/ShippingDialog";
import CancelOrderDialog from "@/components/orders/CancelOrderDialog";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const OrderManagement = () => {
  const { role, currentSellerId } = useDashboard();
  const { orders, isLoading, refetch, updateOrderStatus } = useOrders({
    role: role as "admin" | "seller",
    sellerId: currentSellerId,
  });
  const { canCancelOrder } = useOrderCancellation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders
    .filter((order) =>
      (order.order_number || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((order) => statusFilter === "all" || order.order_status === statusFilter);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    // If changing to shipped, show the shipping dialog
    if (newStatus === "shipped") {
      setSelectedOrderForShipping(order);
      setShippingDialogOpen(true);
      return;
    }

    // If changing to cancelled, show the cancel dialog
    if (newStatus === "cancelled") {
      setSelectedOrderForCancel(order);
      setCancelDialogOpen(true);
      return;
    }
    
    await updateOrderStatus(order.id, newStatus);
  };

  const handleShippingConfirm = async (trackingId: string, courierName: string) => {
    if (!selectedOrderForShipping) return;
    
    await updateOrderStatus(selectedOrderForShipping.id, "shipped", {
      tracking_id: trackingId,
      courier_name: courierName,
    });
  };

  const handlePrintInvoice = (order: Order) => {
    generateOrderInvoice({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      payment_method: order.payment_method,
      total_amount_pkr: order.total_amount_pkr,
      order_status: order.order_status,
      items: order.items,
      created_at: order.created_at,
      tracking_id: order.tracking_id,
      courier_name: order.courier_name,
    });
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

  const getPaymentBadge = (method: string) => {
    const styles: Record<string, string> = {
      "Cash on Delivery": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      "EasyPaisa/JazzCash": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "Bank Transfer": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return styles[method] || "bg-gray-100 text-gray-800";
  };

  // Define allowed status transitions
  const getNextStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return transitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {role === "admin" ? "Order Management" : "My Orders"}
          </h1>
          <p className="text-muted-foreground">
            Manage and track all {role === "seller" ? "your " : ""}orders in real-time
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID or Customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number || `#${order.id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer_phone || order.customer_email || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString("en-PK", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm">{order.items.length} items</TableCell>
                      <TableCell className="font-medium">
                        {formatPKR(order.total_amount_pkr)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getPaymentBadge(order.payment_method))}>
                          {order.payment_method === "Cash on Delivery" ? "COD" : 
                           order.payment_method === "EasyPaisa/JazzCash" ? "Mobile" :
                           order.payment_method === "Bank Transfer" ? "Bank" : order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getNextStatuses(order.order_status).length > 0 ? (
                          <Select
                            value={order.order_status}
                            onValueChange={(value) => handleStatusChange(order, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <Badge className={cn("capitalize", getStatusBadge(order.order_status))}>
                                {order.order_status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={order.order_status} disabled>
                                {order.order_status} (current)
                              </SelectItem>
                              {getNextStatuses(order.order_status).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={cn("capitalize", getStatusBadge(order.order_status))}>
                            {order.order_status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.tracking_id ? (
                          <div className="text-xs">
                            <p className="font-medium">{order.courier_name}</p>
                            <p className="text-muted-foreground">{order.tracking_id}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/account/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            {order.order_status === "processing" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOrderForShipping(order);
                                    setShippingDialogOpen(true);
                                  }}
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Ship Order
                                </DropdownMenuItem>
                              </>
                            )}
                            {canCancelOrder(order.order_status).canCancel && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedOrderForCancel(order);
                                    setCancelDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Dialog */}
      {selectedOrderForShipping && (
        <ShippingDialog
          open={shippingDialogOpen}
          onOpenChange={setShippingDialogOpen}
          orderId={selectedOrderForShipping.id}
          orderNumber={selectedOrderForShipping.order_number || `#${selectedOrderForShipping.id.slice(0, 8)}`}
          onConfirm={handleShippingConfirm}
        />
      )}

      {/* Cancel Order Dialog */}
      {selectedOrderForCancel && (
        <CancelOrderDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          orderId={selectedOrderForCancel.id}
          orderNumber={selectedOrderForCancel.order_number || `#${selectedOrderForCancel.id.slice(0, 8)}`}
          orderStatus={selectedOrderForCancel.order_status}
          paymentStatus={selectedOrderForCancel.payment_status}
          totalAmount={selectedOrderForCancel.total_amount_pkr}
          role={role === "admin" ? "admin" : "seller"}
          onCancelled={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default OrderManagement;

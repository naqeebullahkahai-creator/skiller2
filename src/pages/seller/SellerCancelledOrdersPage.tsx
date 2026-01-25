import { useState } from "react";
import { XCircle, Search, Calendar, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/hooks/useProducts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CancelledOrder {
  id: string;
  order_id: string;
  cancelled_by: string;
  cancelled_by_role: string;
  reason: string;
  refund_amount: number;
  refund_processed: boolean;
  items_restocked: boolean;
  created_at: string;
  order?: {
    id: string;
    order_number: string;
    customer_name: string;
    total_amount_pkr: number;
    created_at: string;
    items: any[];
  };
}

const SellerCancelledOrdersPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<CancelledOrder | null>(null);

  const { data: cancellations = [], isLoading, refetch } = useQuery({
    queryKey: ["seller-cancelled-orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get orders with seller's items that are cancelled
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total_amount_pkr, created_at, items")
        .eq("order_status", "cancelled");

      if (ordersError) throw ordersError;

      // Filter orders that contain seller's products
      const sellerOrders = (orders || []).filter(order => {
        const items = order.items as any[];
        return items?.some(item => item.seller_id === user.id);
      });

      if (sellerOrders.length === 0) return [];

      // Get cancellation logs for these orders
      const orderIds = sellerOrders.map(o => o.id);
      const { data: logs, error: logsError } = await supabase
        .from("cancellation_logs")
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });

      if (logsError) throw logsError;

      // Map logs with order data
      const orderMap = new Map(sellerOrders.map(o => [o.id, o]));
      return (logs || []).map(log => ({
        ...log,
        order: orderMap.get(log.order_id),
      })) as CancelledOrder[];
    },
    enabled: !!user,
  });

  const filteredCancellations = cancellations.filter(c =>
    (c.order?.order_number || c.order_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.order?.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "customer":
        return <Badge variant="outline">Customer</Badge>;
      case "seller":
        return <Badge className="bg-blue-100 text-blue-800">Seller</Badge>;
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <XCircle className="h-6 w-6 text-destructive" />
            Cancelled Orders
          </h1>
          <p className="text-muted-foreground">
            Track cancelled orders and reasons
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cancelled</p>
                <p className="text-2xl font-bold">{cancellations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By Customers</p>
                <p className="text-2xl font-bold">
                  {cancellations.filter(c => c.cancelled_by_role === "customer").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By You</p>
                <p className="text-2xl font-bold">
                  {cancellations.filter(c => c.cancelled_by_role === "seller").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold">
                  {cancellations.filter(c => c.refund_processed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Customer, or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Cancellation History ({filteredCancellations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cancelled By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCancellations.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {log.order?.order_number || `#${log.order_id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        {log.order?.customer_name || "—"}
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(log.cancelled_by_role)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.reason}
                      </TableCell>
                      <TableCell>
                        {log.refund_processed ? (
                          <Badge className="bg-green-100 text-green-800">
                            {formatPKR(log.refund_amount || 0)}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCancellations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No cancelled orders found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancellation Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">
                    {selectedLog.order?.order_number || `#${selectedLog.order_id.slice(0, 8)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedLog.order?.customer_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled By</p>
                  {getRoleBadge(selectedLog.cancelled_by_role)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.created_at), "PPpp")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason for Cancellation</p>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedLog.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-bold text-lg text-primary">
                    {formatPKR(selectedLog.refund_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex gap-2 mt-1">
                    {selectedLog.refund_processed && (
                      <Badge className="bg-green-100 text-green-800">Refunded</Badge>
                    )}
                    {selectedLog.items_restocked && (
                      <Badge className="bg-blue-100 text-blue-800">Restocked</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerCancelledOrdersPage;

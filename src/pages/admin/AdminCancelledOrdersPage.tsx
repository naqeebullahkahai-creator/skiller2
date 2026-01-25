import { useState } from "react";
import { XCircle, Search, RefreshCw, FileText, Users, Store, Shield, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    customer_phone: string;
    total_amount_pkr: number;
    created_at: string;
    items: any[];
  };
  cancelled_by_profile?: {
    full_name: string;
    email: string;
  };
}

const AdminCancelledOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CancelledOrder | null>(null);

  const { data: cancellations = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-cancelled-orders"],
    queryFn: async () => {
      // Get all cancellation logs
      const { data: logs, error: logsError } = await supabase
        .from("cancellation_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logsError) throw logsError;
      if (!logs?.length) return [];

      // Get order details
      const orderIds = [...new Set(logs.map(l => l.order_id))];
      const cancelledByIds = [...new Set(logs.map(l => l.cancelled_by))];

      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from("orders").select("id, order_number, customer_name, customer_phone, total_amount_pkr, created_at, items").in("id", orderIds),
        supabase.from("profiles").select("id, full_name, email").in("id", cancelledByIds),
      ]);

      const orderMap = new Map(ordersRes.data?.map(o => [o.id, o]) || []);
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);

      return logs.map(log => ({
        ...log,
        order: orderMap.get(log.order_id),
        cancelled_by_profile: profileMap.get(log.cancelled_by),
      })) as CancelledOrder[];
    },
  });

  const filteredCancellations = cancellations
    .filter(c =>
      (c.order?.order_number || c.order_id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.order?.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(c => roleFilter === "all" || c.cancelled_by_role === roleFilter);

  const stats = {
    total: cancellations.length,
    byCustomer: cancellations.filter(c => c.cancelled_by_role === "customer").length,
    bySeller: cancellations.filter(c => c.cancelled_by_role === "seller").length,
    byAdmin: cancellations.filter(c => c.cancelled_by_role === "admin").length,
    totalRefunded: cancellations.filter(c => c.refund_processed).reduce((sum, c) => sum + (c.refund_amount || 0), 0),
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "customer":
        return <Badge className="bg-yellow-100 text-yellow-800"><Users className="h-3 w-3 mr-1" />Customer</Badge>;
      case "seller":
        return <Badge className="bg-blue-100 text-blue-800"><Store className="h-3 w-3 mr-1" />Seller</Badge>;
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Cancelled By", "Role", "Reason", "Refund Amount", "Date"];
    const rows = filteredCancellations.map(c => [
      c.order?.order_number || c.order_id,
      c.order?.customer_name || "",
      c.cancelled_by_profile?.full_name || "",
      c.cancelled_by_role,
      `"${c.reason.replace(/"/g, '""')}"`,
      c.refund_amount || 0,
      format(new Date(c.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FANZON_Cancelled_Orders_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            Platform-wide cancellation tracking and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By Customers</p>
                <p className="text-2xl font-bold">{stats.byCustomer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By Sellers</p>
                <p className="text-2xl font-bold">{stats.bySeller}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">By Admin</p>
                <p className="text-2xl font-bold">{stats.byAdmin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-lg font-bold">{formatPKR(stats.totalRefunded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Customer, or Reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="seller">Sellers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Cancellation Logs ({filteredCancellations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
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
                    <TableHead>Role</TableHead>
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
                        <div>
                          <p className="font-medium">{log.order?.customer_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{log.order?.customer_phone || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.cancelled_by_profile?.full_name || "System"}
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
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCancellations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Cancellation Details
            </DialogTitle>
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
                  <p className="text-sm text-muted-foreground">Order Total</p>
                  <p className="font-medium">
                    {formatPKR(selectedLog.order?.total_amount_pkr || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedLog.order?.customer_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.order?.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled By</p>
                  <p className="font-medium">{selectedLog.cancelled_by_profile?.full_name || "System"}</p>
                  {getRoleBadge(selectedLog.cancelled_by_role)}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason for Cancellation</p>
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm">{selectedLog.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Refund Amount</p>
                  <p className="font-bold text-lg text-primary">
                    {formatPKR(selectedLog.refund_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Status</p>
                  {selectedLog.refund_processed ? (
                    <Badge className="bg-green-100 text-green-800">Processed</Badge>
                  ) : (
                    <Badge variant="outline">Not Applicable</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inventory</p>
                  {selectedLog.items_restocked ? (
                    <Badge className="bg-blue-100 text-blue-800">Restocked</Badge>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Cancelled At</p>
                <p className="font-medium">
                  {format(new Date(selectedLog.created_at), "PPpp")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCancelledOrdersPage;

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useOrderCancellation } from "@/hooks/useOrderCancellation";
import { formatPKR } from "@/hooks/useProducts";
import { AlertTriangle, XCircle, User, Store, Shield, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminCancellationsPage = () => {
  const {
    fetchCancellationLogs,
    cancellationLogs,
    isLoadingLogs,
    getSellerCancellationStats,
  } = useOrderCancellation();

  useEffect(() => {
    fetchCancellationLogs("admin");
  }, []);

  const sellerStats = getSellerCancellationStats();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "customer":
        return (
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            Customer
          </Badge>
        );
      case "seller":
        return (
          <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            <Store className="h-3 w-3" />
            Seller
          </Badge>
        );
      case "admin":
        return (
          <Badge className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <XCircle className="h-6 w-6 text-destructive" />
          Cancellation Logs
        </h1>
        <p className="text-muted-foreground">
          Monitor order cancellations and identify sellers with high cancellation rates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cancellationLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Cancellations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-500/10">
                <Store className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cancellationLogs.filter((l) => l.cancelled_by_role === "seller").length}
                </p>
                <p className="text-sm text-muted-foreground">By Sellers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cancellationLogs.filter((l) => l.cancelled_by_role === "customer").length}
                </p>
                <p className="text-sm text-muted-foreground">By Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingDown className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatPKR(
                    cancellationLogs.reduce((sum, l) => sum + l.refund_amount, 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers with High Cancellations */}
      {sellerStats.length > 0 && (
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Sellers with Most Cancellations
            </CardTitle>
            <CardDescription>
              Monitor sellers who cancel orders frequently - this may indicate inventory issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead className="text-center">Cancellations</TableHead>
                  <TableHead className="text-right">Total Refunded</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellerStats.slice(0, 10).map((stat) => (
                  <TableRow key={stat.seller_id}>
                    <TableCell className="font-medium">{stat.seller_name}</TableCell>
                    <TableCell className="text-center">{stat.count}</TableCell>
                    <TableCell className="text-right">
                      {formatPKR(stat.total_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.count >= 5 ? (
                        <Badge variant="destructive">High Risk</Badge>
                      ) : stat.count >= 3 ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Monitor
                        </Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Cancellation Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Cancellation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cancelled By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Restocked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancellationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString("en-PK", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString("en-PK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.order?.order_number || `#${log.order_id.slice(0, 8)}`}
                      </TableCell>
                      <TableCell>{log.order?.customer_name || "—"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getRoleBadge(log.cancelled_by_role)}
                          {log.cancelled_by_role === "seller" && log.seller_name && (
                            <p className="text-xs text-muted-foreground">{log.seller_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </TableCell>
                      <TableCell>
                        {log.refund_amount > 0 ? (
                          <div>
                            <p className="font-medium text-green-600">
                              {formatPKR(log.refund_amount)}
                            </p>
                            {log.refund_processed && (
                              <Badge variant="outline" className="text-xs">
                                Processed
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.items_restocked ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {cancellationLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No cancellations found
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

export default AdminCancellationsPage;

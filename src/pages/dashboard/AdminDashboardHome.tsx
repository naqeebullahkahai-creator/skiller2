import {
  DollarSign,
  ShoppingCart,
  Package,
  UserCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { cn } from "@/lib/utils";
import AdminGlobalNotification from "@/components/dashboard/AdminGlobalNotification";
import DataSanitization from "@/components/dashboard/DataSanitization";

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminDashboardHome = () => {
  const { stats, recentOrders, salesData, isLoading, refetch } = useAdminDashboardAnalytics();

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? formatPKR(stats.totalRevenue) : "—",
      icon: DollarSign,
      change: stats ? `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%` : "—",
      trend: stats ? (stats.revenueChange >= 0 ? "up" : "down") : "up",
      color: "text-emerald-500",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders?.toLocaleString() || "—",
      icon: ShoppingCart,
      change: stats ? `${stats.ordersChange >= 0 ? "+" : ""}${stats.ordersChange}%` : "—",
      trend: stats ? (stats.ordersChange >= 0 ? "up" : "down") : "up",
      color: "text-blue-500",
    },
    {
      title: "Active Products",
      value: stats?.activeProducts?.toLocaleString() || "—",
      icon: Package,
      change: stats ? `${stats.productsChange >= 0 ? "+" : ""}${stats.productsChange}%` : "—",
      trend: stats ? (stats.productsChange >= 0 ? "up" : "down") : "up",
      color: "text-purple-500",
    },
    {
      title: "Pending Approvals",
      value: stats?.pendingApprovals?.toLocaleString() || "—",
      icon: UserCheck,
      change: "Requires action",
      trend: "neutral",
      color: "text-amber-500",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of your marketplace performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <DataSanitization />
          <AdminGlobalNotification />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp size={14} className="text-emerald-500" />
                      ) : stat.trend === "down" ? (
                        <TrendingDown size={14} className="text-destructive" />
                      ) : null}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          stat.trend === "up" ? "text-emerald-500" : 
                          stat.trend === "down" ? "text-destructive" : 
                          "text-muted-foreground"
                        )}
                      >
                        {stat.change}
                      </span>
                      {stat.trend !== "neutral" && (
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      )}
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-lg bg-muted", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Growth Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sales Growth (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading chart data...</p>
                </div>
              </div>
            ) : salesData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-muted-foreground">No sales data available yet</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatPKR(value), "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm">{order.customerName}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatPKR(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("capitalize", getStatusBadge(order.status))}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardHome;

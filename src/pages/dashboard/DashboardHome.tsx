import {
  DollarSign,
  ShoppingCart,
  Package,
  UserCheck,
  TrendingUp,
  TrendingDown,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboard } from "@/contexts/DashboardContext";
import {
  dashboardStats,
  salesData,
  recentOrders,
  formatPKR,
} from "@/data/dashboardData";
import { cn } from "@/lib/utils";
import AdminGlobalNotification from "@/components/dashboard/AdminGlobalNotification";

const DashboardHome = () => {
  const { role, currentSellerId } = useDashboard();

  // Filter orders for seller view
  const filteredOrders = role === "seller"
    ? recentOrders.filter((order) => order.sellerId === currentSellerId)
    : recentOrders;

  // Adjust stats for seller view (demo purposes)
  const stats = role === "seller"
    ? {
        totalRevenue: 847500,
        totalOrders: 156,
        activeProducts: 24,
        pendingApprovals: 3,
      }
    : dashboardStats;

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPKR(stats.totalRevenue),
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
      color: "text-fanzon-success",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: "+8.2%",
      trend: "up",
      color: "text-blue-500",
    },
    {
      title: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      icon: Package,
      change: "+3.1%",
      trend: "up",
      color: "text-purple-500",
    },
    {
      title: role === "admin" ? "Pending Approvals" : "Pending Products",
      value: stats.pendingApprovals.toLocaleString(),
      icon: UserCheck,
      change: "-2.4%",
      trend: "down",
      color: "text-fanzon-warning",
      adminOnly: false,
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {role === "admin"
              ? "Welcome back! Here's your store overview."
              : "Welcome back! Here's your seller dashboard."}
          </p>
        </div>
        {role === "admin" && <AdminGlobalNotification />}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp size={14} className="text-fanzon-success" />
                    ) : (
                      <TrendingDown size={14} className="text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        stat.trend === "up" ? "text-fanzon-success" : "text-destructive"
                      )}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg bg-muted", stat.color)}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Growth Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Sales Growth</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {filteredOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-sm">
                        {order.orderId}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Package, Star, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useSellerPerformance } from "@/hooks/useSellerPerformance";

const formatPKR = (amount: number) => {
  if (amount >= 1000000) {
    return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(0)}K`;
  }
  return `Rs. ${amount.toFixed(0)}`;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

interface SellerPerformanceChartsProps {
  sellerId: string;
}

const SellerPerformanceCharts = ({ sellerId }: SellerPerformanceChartsProps) => {
  const { performance, isLoading } = useSellerPerformance(sellerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const orderStatusData = [
    { name: 'Delivered', value: performance.deliveredOrders, color: 'hsl(142, 76%, 36%)' },
    { name: 'Cancelled', value: performance.cancelledOrders, color: 'hsl(0, 84%, 60%)' },
    { name: 'Returned', value: performance.returnedOrders, color: 'hsl(45, 93%, 47%)' },
    { name: 'Other', value: Math.max(0, performance.totalOrders - performance.deliveredOrders - performance.cancelledOrders - performance.returnedOrders), color: 'hsl(217, 91%, 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Sales Performance (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performance.salesByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performance.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => formatPKR(value)} 
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => [formatPKR(value), 'Sales']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Order Fulfillment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package size={18} className="text-primary" />
              Order Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{performance.fulfillmentRate}%</span>
              <Badge variant={performance.fulfillmentRate >= 80 ? "default" : "secondary"}>
                {performance.fulfillmentRate >= 80 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <Progress value={performance.fulfillmentRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={14} className="text-green-500" />
                <span>Delivered: {performance.deliveredOrders}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <XCircle size={14} className="text-red-500" />
                <span>Cancelled: {performance.cancelledOrders}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw size={14} className="text-yellow-500" />
                <span>Returned: {performance.returnedOrders}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package size={14} className="text-blue-500" />
                <span>Total: {performance.totalOrders}</span>
              </div>
            </div>

            {orderStatusData.length > 0 && (
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Ratings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />
              Customer Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">{performance.averageRating.toFixed(1)}</span>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.round(performance.averageRating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground"
                      }
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{performance.totalReviews} reviews</p>
              </div>
            </div>

            <div className="space-y-2">
              {performance.ratingBreakdown.map((rating) => {
                const percentage = performance.totalReviews > 0 
                  ? (rating.count / performance.totalReviews) * 100 
                  : 0;
                return (
                  <div key={rating.stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{rating.stars}</span>
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="w-8 text-right text-muted-foreground">{rating.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      {performance.topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                  </div>
                  <span className="font-semibold text-primary">{formatPKR(product.sales)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SellerPerformanceCharts;

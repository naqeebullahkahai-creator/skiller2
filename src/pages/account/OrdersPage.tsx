import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ChevronRight, ShoppingBag, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  product_id: string;
  title: string;
  price_pkr: number;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  order_number: string | null;
  customer_name: string;
  shipping_address: string;
  payment_method: string;
  total_amount_pkr: number;
  order_status: string;
  payment_status: string;
  items: OrderItem[];
  created_at: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", label: "Confirmed" },
  processing: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", label: "Processing" },
  shipped: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400", label: "Shipped" },
  delivered: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Cancelled" },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel("orders-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `customer_id=eq.${user.id}`,
          },
          (payload) => {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new, items: (Array.isArray(payload.new.items) ? payload.new.items : order.items) as OrderItem[] }
                  : order
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const parsedOrders = (data || []).map((order) => ({
        ...order,
        items: (Array.isArray(order.items) ? order.items : []) as unknown as OrderItem[],
      }));

      setOrders(parsedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package size={20} />
          My Orders
        </CardTitle>
        <CardDescription>
          View and track all your orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.pending;
              
              return (
                <div
                  key={order.id}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">
                          {order.order_number || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(order.created_at).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", status.color)}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Items Preview */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {order.items.slice(0, 4).map((item, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-muted"
                      >
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex-shrink-0 w-14 h-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </p>
                      <p className="font-semibold text-primary">
                        {formatPKR(order.total_amount_pkr)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/account/orders/${order.id}`}>
                        View Details
                        <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersPage;

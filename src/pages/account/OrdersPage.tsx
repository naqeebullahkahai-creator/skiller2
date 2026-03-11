import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/empty-state";
import { useIsMobile } from "@/hooks/use-mobile";

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

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchOrders();
      
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

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.order_status === activeTab);
  }, [orders, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      counts[o.order_status] = (counts[o.order_status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="w-14 h-14 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return <EmptyState type="orders" />;
  }

  const renderOrderCard = (order: Order) => {
    const status = statusConfig[order.order_status] || statusConfig.pending;
    const firstItem = order.items[0];
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    if (isMobile) {
      return (
        <Link
          key={order.id}
          to={`/account/orders/${order.id}`}
          className="block bg-card border border-border rounded-xl p-3.5 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              {order.order_number || `#${order.id.slice(0, 8)}`}
            </span>
            <Badge variant="secondary" className={cn("capitalize text-[10px] px-2 py-0.5", status.color)}>
              {status.label}
            </Badge>
          </div>
          <div className="flex gap-3">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-card flex-shrink-0" style={{ zIndex: 3 - index }}>
                  <img src={item.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{firstItem?.title || "Order"}</p>
              <p className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"} · {new Date(order.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
            <span className="font-semibold text-sm text-primary">{formatPKR(order.total_amount_pkr)}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </Link>
      );
    }

    return (
      <div key={order.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold">{order.order_number || `Order #${order.id.slice(0, 8)}`}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={cn("capitalize", status.color)}>{status.label}</Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {order.items.slice(0, 4).map((item, index) => (
            <div key={index} className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden bg-muted">
              <img src={item.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="flex-shrink-0 w-14 h-14 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">+{order.items.length - 4}</div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p>
            <p className="font-semibold text-primary">{formatPKR(order.total_amount_pkr)}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/account/orders/${order.id}`}>View Details <ChevronRight size={16} className="ml-1" /></Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!isMobile && (
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package size={20} />
              My Orders
            </CardTitle>
            <CardDescription>View and track all your orders</CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto flex no-scrollbar h-auto p-1 bg-muted/50">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm px-2.5 py-1.5 shrink-0">
              {tab.label}
              {(tabCounts[tab.value] || 0) > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {tabCounts[tab.value] || 0}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-medium text-foreground">No {activeTab === "all" ? "" : activeTab} orders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "all" ? "You haven't placed any orders yet." : `You don't have any ${activeTab} orders.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={isMobile ? "space-y-3" : "space-y-4"}>
              {filteredOrders.map(renderOrderCard)}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default OrdersPage;

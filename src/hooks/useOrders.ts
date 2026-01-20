import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface OrderItem {
  product_id: string;
  seller_id: string;
  title: string;
  price_pkr: number;
  quantity: number;
  image_url: string | null;
  variant?: string;
}

export interface Order {
  id: string;
  order_number: string | null;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  shipping_address: string;
  payment_method: string;
  payment_status: string;
  total_amount_pkr: number;
  order_status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  tracking_id: string | null;
  courier_name: string | null;
}

interface UseOrdersOptions {
  role: "admin" | "seller";
  sellerId?: string;
}

export const useOrders = ({ role, sellerId }: UseOrdersOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // For sellers, filter by their products in the order items
      // This is a simplified approach - in production you'd use a join or view
      const { data, error } = await query;

      if (error) throw error;

      let parsedOrders = (data || []).map((order: any) => ({
        ...order,
        items: (Array.isArray(order.items) ? order.items : []) as OrderItem[],
      }));

      // If seller, filter orders that contain their products
      if (role === "seller" && sellerId) {
        parsedOrders = parsedOrders.filter((order) =>
          order.items.some((item: OrderItem) => item.seller_id === sellerId)
        );
      }

      setOrders(parsedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, role, sellerId, toast]);

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = {
              ...payload.new,
              items: (Array.isArray(payload.new.items) ? payload.new.items : []) as OrderItem[],
            } as Order;
            
            // Check if this order belongs to the seller (if seller view)
            if (role === "seller" && sellerId) {
              if (!newOrder.items.some((item) => item.seller_id === sellerId)) {
                return;
              }
            }
            
            setOrders((prev) => [newOrder, ...prev]);
            toast({
              title: "New Order!",
              description: `Order ${newOrder.order_number || newOrder.id.slice(0, 8)} received`,
            });
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? {
                      ...order,
                      ...payload.new,
                      items: (Array.isArray(payload.new.items) ? payload.new.items : order.items) as OrderItem[],
                    }
                  : order
              )
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, role, sellerId, toast]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    trackingInfo?: { tracking_id: string; courier_name: string }
  ) => {
    try {
      const updateData: any = { order_status: newStatus };
      
      if (trackingInfo) {
        updateData.tracking_id = trackingInfo.tracking_id;
        updateData.courier_name = trackingInfo.courier_name;
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });

      return true;
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    orders,
    isLoading,
    refetch: fetchOrders,
    updateOrderStatus,
  };
};

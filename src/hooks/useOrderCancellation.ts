import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CancellationLog {
  id: string;
  order_id: string;
  cancelled_by: string;
  cancelled_by_role: "customer" | "seller" | "admin";
  reason: string;
  refund_amount: number;
  refund_processed: boolean;
  items_restocked: boolean;
  created_at: string;
  order?: {
    order_number: string | null;
    customer_name: string;
    total_amount_pkr: number;
  };
  seller_name?: string;
}

export const CUSTOMER_CANCELLATION_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Delivery time too long",
  "Ordered by mistake",
  "Want to change address",
  "Want to change payment method",
  "Other",
];

export const SELLER_CANCELLATION_REASONS = [
  "Out of Stock",
  "Product discontinued",
  "Pricing error",
  "Cannot ship to this location",
  "Suspected fraudulent order",
  "Other",
];

interface CancelOrderResult {
  success: boolean;
  message: string;
  refund_amount?: number;
  refund_processed?: boolean;
}

export const useOrderCancellation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationLogs, setCancellationLogs] = useState<CancellationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const cancelOrder = async (
    orderId: string,
    reason: string,
    role: "customer" | "seller" | "admin"
  ): Promise<CancelOrderResult> => {
    if (!user) {
      return { success: false, message: "Not authenticated" };
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("cancel_order_with_refund", {
        p_order_id: orderId,
        p_cancelled_by: user.id,
        p_cancelled_by_role: role,
        p_reason: reason,
      });

      if (error) throw error;

      const result = data as unknown as CancelOrderResult;

      if (result.success) {
        toast({
          title: "Order Cancelled",
          description: result.refund_processed
            ? `Rs. ${result.refund_amount?.toLocaleString()} has been credited to your FANZON Wallet.`
            : result.message,
        });
      } else {
        toast({
          title: "Cannot Cancel Order",
          description: result.message,
          variant: "destructive",
        });
      }

      return result;
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order",
        variant: "destructive",
      });
      return { success: false, message: error.message || "Failed to cancel order" };
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelOrder = (orderStatus: string): { canCancel: boolean; message: string } => {
    if (orderStatus === "pending" || orderStatus === "processing") {
      return { canCancel: true, message: "" };
    }
    if (orderStatus === "shipped") {
      return {
        canCancel: false,
        message: "This order is already with the courier and cannot be cancelled.",
      };
    }
    if (orderStatus === "delivered") {
      return {
        canCancel: false,
        message: "This order has been delivered. Please use the returns process.",
      };
    }
    if (orderStatus === "cancelled") {
      return { canCancel: false, message: "This order is already cancelled." };
    }
    return { canCancel: false, message: "Cannot cancel this order." };
  };

  const fetchCancellationLogs = async (role: "admin" | "seller") => {
    if (!user) return;

    setIsLoadingLogs(true);

    try {
      const { data, error } = await supabase
        .from("cancellation_logs")
        .select(`
          *,
          order:orders(order_number, customer_name, total_amount_pkr)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For admin, also fetch seller info for seller cancellations
      const logsWithSellerInfo = await Promise.all(
        (data || []).map(async (log: any) => {
          if (log.cancelled_by_role === "seller") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", log.cancelled_by)
              .maybeSingle();
            return { ...log, seller_name: profile?.full_name || "Unknown Seller" };
          }
          return log;
        })
      );

      setCancellationLogs(logsWithSellerInfo);
    } catch (error) {
      console.error("Error fetching cancellation logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const getSellerCancellationStats = () => {
    const sellerCancellations = cancellationLogs.filter(
      (log) => log.cancelled_by_role === "seller"
    );

    const statsBySeller = sellerCancellations.reduce((acc, log) => {
      const sellerId = log.cancelled_by;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller_id: sellerId,
          seller_name: log.seller_name || "Unknown",
          count: 0,
          total_amount: 0,
        };
      }
      acc[sellerId].count++;
      acc[sellerId].total_amount += log.refund_amount;
      return acc;
    }, {} as Record<string, { seller_id: string; seller_name: string; count: number; total_amount: number }>);

    return Object.values(statsBySeller).sort((a, b) => b.count - a.count);
  };

  return {
    cancelOrder,
    canCancelOrder,
    isLoading,
    fetchCancellationLogs,
    cancellationLogs,
    isLoadingLogs,
    getSellerCancellationStats,
    CUSTOMER_CANCELLATION_REASONS,
    SELLER_CANCELLATION_REASONS,
  };
};

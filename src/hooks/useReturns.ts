import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_item_id: string;
  customer_id: string;
  seller_id: string;
  product_id: string;
  reason: string;
  additional_comments: string | null;
  photos: string[];
  status: string;
  refund_amount: number;
  quantity: number;
  seller_response: string | null;
  seller_responded_at: string | null;
  admin_decision: string | null;
  admin_decided_at: string | null;
  admin_id: string | null;
  tracking_number: string | null;
  refund_processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnRequestWithDetails extends ReturnRequest {
  product_title?: string;
  product_image?: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
}

const RETURN_REASONS = [
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "damaged", label: "Item Damaged" },
  { value: "quality_not_as_expected", label: "Quality Not as Expected" },
  { value: "size_fit_issue", label: "Size/Fit Issue" },
  { value: "changed_mind", label: "Changed My Mind" },
  { value: "other", label: "Other" },
];

const RETURN_STATUS_LABELS: Record<string, string> = {
  return_requested: "Return Requested",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  item_shipped: "Item Shipped",
  item_received: "Item Received",
  refund_issued: "Refund Issued",
};

export { RETURN_REASONS, RETURN_STATUS_LABELS };

// Check if return can be requested (within 7 days of delivery)
export const canRequestReturn = async (orderId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("can_request_return", { p_order_id: orderId });
  if (error) {
    console.error("Error checking return eligibility:", error);
    return false;
  }
  return data || false;
};

// Customer: Create return request
export const useCreateReturnRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createReturn = async (data: {
    order_id: string;
    order_item_id: string;
    seller_id: string;
    product_id: string;
    reason: string;
    additional_comments?: string;
    photos?: string[];
    refund_amount: number;
    quantity: number;
  }): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("return_requests").insert({
        order_id: data.order_id,
        order_item_id: data.order_item_id,
        seller_id: data.seller_id,
        product_id: data.product_id,
        reason: data.reason as any,
        additional_comments: data.additional_comments || null,
        photos: data.photos || [],
        refund_amount: data.refund_amount,
        quantity: data.quantity,
        customer_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Return Request Submitted",
        description: "Your return request has been submitted for review.",
      });
      return true;
    } catch (err: any) {
      console.error("Error creating return:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit return request",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createReturn, isLoading };
};

// Customer: Fetch my return requests
export const useCustomerReturns = () => {
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReturns();
  }, [user]);

  const fetchReturns = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch product details
      const enrichedReturns = await Promise.all(
        (data || []).map(async (ret) => {
          const { data: product } = await supabase
            .from("products")
            .select("title, images")
            .eq("id", ret.product_id)
            .single();

          const { data: order } = await supabase
            .from("orders")
            .select("order_number")
            .eq("id", ret.order_id)
            .single();

          return {
            ...ret,
            product_title: product?.title,
            product_image: product?.images?.[0],
            order_number: order?.order_number,
          };
        })
      );

      setReturns(enrichedReturns);
    } catch (err: any) {
      console.error("Error fetching returns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { returns, isLoading, refetch: fetchReturns };
};

// Seller: Fetch return requests for my products
export const useSellerReturns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchReturns();
  }, [user]);

  const fetchReturns = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch additional details
      const enrichedReturns = await Promise.all(
        (data || []).map(async (ret) => {
          const { data: product } = await supabase
            .from("products")
            .select("title, images")
            .eq("id", ret.product_id)
            .single();

          const { data: order } = await supabase
            .from("orders")
            .select("order_number, customer_name")
            .eq("id", ret.order_id)
            .single();

          return {
            ...ret,
            product_title: product?.title,
            product_image: product?.images?.[0],
            order_number: order?.order_number,
            customer_name: order?.customer_name,
          };
        })
      );

      setReturns(enrichedReturns);
    } catch (err: any) {
      console.error("Error fetching seller returns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const respondToReturn = async (
    returnId: string,
    action: "approve" | "reject",
    response?: string
  ): Promise<boolean> => {
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      const { error } = await supabase
        .from("return_requests")
        .update({
          status: newStatus,
          seller_response: response || null,
          seller_responded_at: new Date().toISOString(),
        })
        .eq("id", returnId);

      if (error) throw error;

      toast({
        title: action === "approve" ? "Return Approved" : "Return Rejected",
        description: action === "approve"
          ? "The customer will be notified to ship the item back."
          : "The customer has been notified of the rejection.",
      });

      await fetchReturns();
      return true;
    } catch (err: any) {
      console.error("Error responding to return:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update return",
        variant: "destructive",
      });
      return false;
    }
  };

  const confirmItemReceived = async (returnId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("return_requests")
        .update({ status: "item_received" })
        .eq("id", returnId);

      if (error) throw error;

      toast({
        title: "Item Received",
        description: "The refund will be processed by the admin.",
      });

      await fetchReturns();
      return true;
    } catch (err: any) {
      console.error("Error confirming item received:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
      return false;
    }
  };

  return { returns, isLoading, respondToReturn, confirmItemReceived, refetch: fetchReturns };
};

// Admin: Fetch all return requests
export const useAdminReturns = () => {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch additional details
      const enrichedReturns = await Promise.all(
        (data || []).map(async (ret) => {
          const { data: product } = await supabase
            .from("products")
            .select("title, images")
            .eq("id", ret.product_id)
            .single();

          const { data: order } = await supabase
            .from("orders")
            .select("order_number, customer_name")
            .eq("id", ret.order_id)
            .single();

          return {
            ...ret,
            product_title: product?.title,
            product_image: product?.images?.[0],
            order_number: order?.order_number,
            customer_name: order?.customer_name,
          };
        })
      );

      setReturns(enrichedReturns);
    } catch (err: any) {
      console.error("Error fetching admin returns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const adminOverride = async (
    returnId: string,
    action: "approve" | "reject",
    decision: string,
    adminId: string
  ): Promise<boolean> => {
    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      const { error } = await supabase
        .from("return_requests")
        .update({
          status: newStatus,
          admin_decision: decision,
          admin_decided_at: new Date().toISOString(),
          admin_id: adminId,
        })
        .eq("id", returnId);

      if (error) throw error;

      toast({
        title: "Admin Decision Applied",
        description: `Return has been ${action === "approve" ? "approved" : "rejected"} by admin.`,
      });

      await fetchReturns();
      return true;
    } catch (err: any) {
      console.error("Error applying admin decision:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to apply decision",
        variant: "destructive",
      });
      return false;
    }
  };

  const processRefund = async (returnId: string, adminId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("process_customer_refund", {
        p_return_request_id: returnId,
        p_admin_id: adminId,
      });

      if (error) throw error;

      if (!data) {
        toast({
          title: "Refund Failed",
          description: "The refund could not be processed. It may have already been issued.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Refund Issued",
        description: "The refund has been credited to the customer's wallet.",
      });

      await fetchReturns();
      return true;
    } catch (err: any) {
      console.error("Error processing refund:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to process refund",
        variant: "destructive",
      });
      return false;
    }
  };

  return { returns, isLoading, adminOverride, processRefund, refetch: fetchReturns };
};

// Customer wallet
export const useCustomerWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{
    id: string;
    balance: number;
    total_refunds: number;
    total_spent: number;
  } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWallet();
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let { data: walletData, error } = await supabase
        .from("customer_wallets")
        .select("*")
        .eq("customer_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Create wallet if doesn't exist
      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from("customer_wallets")
          .insert({ customer_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        walletData = newWallet;
      }

      setWallet(walletData);

      // Fetch transactions
      if (walletData) {
        const { data: txns } = await supabase
          .from("customer_wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false });

        setTransactions(txns || []);
      }
    } catch (err: any) {
      console.error("Error fetching wallet:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { wallet, transactions, isLoading, refetch: fetchWallet };
};

// Upload return photos
export const uploadReturnPhoto = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `returns/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};

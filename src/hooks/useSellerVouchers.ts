import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SellerVoucher {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_spend_pkr: number;
  expiry_date: string;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  voucher_type: "code" | "collectible";
  one_per_customer: boolean;
  seller_id: string | null;
  product_id: string | null;
  created_at: string;
}

export interface CreateVoucherData {
  code: string;
  title?: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_spend_pkr: number;
  expiry_date: string;
  usage_limit?: number;
  voucher_type: "code" | "collectible";
  one_per_customer: boolean;
  product_id?: string;
}

export const useSellerVouchers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["seller-vouchers", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SellerVoucher[];
    },
    enabled: !!user?.id,
  });

  const createVoucher = useMutation({
    mutationFn: async (voucherData: CreateVoucherData) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("vouchers")
        .insert({
          ...voucherData,
          seller_id: user.id,
          is_active: true,
          used_count: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-vouchers"] });
      toast({
        title: "Voucher Created",
        description: "Your voucher has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("vouchers")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("seller_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-vouchers"] });
    },
  });

  const deleteVoucher = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", id)
        .eq("seller_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-vouchers"] });
      toast({
        title: "Voucher Deleted",
        description: "The voucher has been removed.",
      });
    },
  });

  return {
    vouchers,
    isLoading,
    createVoucher: createVoucher.mutate,
    isCreating: createVoucher.isPending,
    toggleActive: toggleActive.mutate,
    deleteVoucher: deleteVoucher.mutate,
  };
};

// Hook to get collectible vouchers for a seller (for public display)
export const useSellerCollectibleVouchers = (sellerId?: string) => {
  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["collectible-vouchers", sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("voucher_type", "collectible")
        .eq("is_active", true)
        .gt("expiry_date", new Date().toISOString());
      
      if (error) throw error;
      return data as SellerVoucher[];
    },
    enabled: !!sellerId,
  });

  return { vouchers, isLoading };
};

// Hook to get vouchers applicable to a specific product
export const useProductVouchers = (productId?: string, sellerId?: string) => {
  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ["product-vouchers", productId, sellerId],
    queryFn: async () => {
      if (!productId && !sellerId) return [];
      
      let query = supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .gt("expiry_date", new Date().toISOString());
      
      // Get vouchers specific to this product OR seller-wide vouchers
      if (productId && sellerId) {
        query = query.or(`product_id.eq.${productId},and(seller_id.eq.${sellerId},product_id.is.null)`);
      } else if (sellerId) {
        query = query.eq("seller_id", sellerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SellerVoucher[];
    },
    enabled: !!(productId || sellerId),
  });

  return { vouchers, isLoading };
};

// Hook to manage collected vouchers
export const useCollectedVouchers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collectedVouchers = [], isLoading } = useQuery({
    queryKey: ["collected-vouchers", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("collected_vouchers")
        .select(`
          *,
          voucher:vouchers(*)
        `)
        .eq("user_id", user.id)
        .is("used_at", null);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const collectVoucher = useMutation({
    mutationFn: async (voucherId: string) => {
      if (!user?.id) throw new Error("Please log in to collect vouchers");
      
      const { data, error } = await supabase
        .from("collected_vouchers")
        .insert({
          user_id: user.id,
          voucher_id: voucherId,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already collected this voucher");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collected-vouchers"] });
      toast({
        title: "Voucher Collected! 🎉",
        description: "The voucher has been added to your account.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsUsed = useMutation({
    mutationFn: async (collectedVoucherId: string) => {
      const { error } = await supabase
        .from("collected_vouchers")
        .update({ used_at: new Date().toISOString() })
        .eq("id", collectedVoucherId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collected-vouchers"] });
    },
  });

  const isVoucherCollected = (voucherId: string) => {
    return collectedVouchers.some((cv: any) => cv.voucher_id === voucherId);
  };

  return {
    collectedVouchers,
    isLoading,
    collectVoucher: collectVoucher.mutate,
    isCollecting: collectVoucher.isPending,
    markAsUsed: markAsUsed.mutate,
    isVoucherCollected,
  };
};

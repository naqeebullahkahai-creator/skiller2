import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AdminStoreSettings {
  id: string;
  store_name: string;
  store_description: string | null;
  store_logo_url: string | null;
  store_banner_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminStoreWallet {
  id: string;
  total_balance: number;
  total_earnings: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface AdminStoreTransaction {
  id: string;
  order_id: string | null;
  amount: number;
  transaction_type: string;
  description: string | null;
  product_title: string | null;
  created_at: string;
}

export const useAdminStore = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Store settings
  const { data: storeSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin-store-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_store_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AdminStoreSettings | null;
    },
    enabled: !!user,
  });

  // Store wallet
  const { data: storeWallet, isLoading: walletLoading } = useQuery({
    queryKey: ["admin-store-wallet"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_store_wallet" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AdminStoreWallet | null;
    },
    enabled: !!user,
  });

  // Store transactions
  const { data: transactions, isLoading: txnLoading } = useQuery({
    queryKey: ["admin-store-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_store_transactions" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as AdminStoreTransaction[];
    },
    enabled: !!user,
  });

  // Admin products - use any type to avoid deep type instantiation
  const { data: adminProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-store-products"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*")
        .eq("is_admin_product", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  // Admin store orders (orders containing admin products)
  const { data: adminOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-store-orders"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("orders")
        .select("*")
        .eq("is_admin_order", true)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) {
        console.warn("Admin orders query failed:", error);
        return [] as any[];
      }
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  // Update store settings
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<AdminStoreSettings>) => {
      if (!storeSettings?.id) throw new Error("No store settings found");
      const { error } = await supabase
        .from("admin_store_settings" as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", storeSettings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Store settings updated");
      queryClient.invalidateQueries({ queryKey: ["admin-store-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    storeSettings,
    storeWallet,
    transactions,
    adminProducts,
    adminOrders,
    updateSettings,
    isLoading: settingsLoading || walletLoading || txnLoading || productsLoading,
    ordersLoading,
  };
};

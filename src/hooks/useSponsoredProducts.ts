import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSponsoredProducts = (placement?: string) => {
  const { data: sponsored = [], isLoading } = useQuery({
    queryKey: ["sponsored-products", placement],
    queryFn: async () => {
      let q = supabase.from("sponsored_products").select("*, products(*)").eq("status", "active");
      if (placement) q = q.eq("placement", placement);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });
  return { sponsored, isLoading };
};

export const useSellerSponsored = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["seller-sponsored", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("sponsored_products")
        .select("*, products(title, images)").eq("seller_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createAd = useMutation({
    mutationFn: async (ad: any) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Deduct budget from seller wallet
      const { data: wallet } = await supabase.from("seller_wallets").select("*").eq("seller_id", user.id).maybeSingle();
      if (!wallet || wallet.current_balance < ad.budget_pkr) throw new Error("Insufficient wallet balance");

      await supabase.from("seller_wallets").update({
        current_balance: wallet.current_balance - ad.budget_pkr,
      }).eq("seller_id", user.id);

      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id, seller_id: user.id, transaction_type: "platform_fee",
        gross_amount: ad.budget_pkr, net_amount: -ad.budget_pkr,
        description: `Sponsored product ad budget`,
      });

      const { error } = await supabase.from("sponsored_products").insert({ ...ad, seller_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-sponsored"] });
      toast.success("Ad campaign created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { ads, isLoading, createAd };
};

export const useAdminSponsored = () => {
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin-sponsored"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsored_products")
        .select("*, products(title, images)").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateAd = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("sponsored_products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsored"] });
      toast.success("Ad updated");
    },
  });

  return { ads, isLoading, updateAd };
};

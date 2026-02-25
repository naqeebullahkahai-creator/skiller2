import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useGroupBuyDeals = () => {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["group-buy-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_buy_deals")
        .select("*, products(*), group_buy_participants(count)")
        .eq("status", "active")
        .gte("ends_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
  return { deals, isLoading };
};

export const useJoinGroupBuy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string) => {
      if (!user?.id) throw new Error("Please login to join");
      const { error } = await supabase.from("group_buy_participants").insert({ deal_id: dealId, user_id: user.id });
      if (error) {
        if (error.code === "23505") throw new Error("Already joined!");
        throw error;
      }
      // Update participant count
      await supabase.from("group_buy_deals").update({
        current_participants: (await supabase.from("group_buy_participants").select("*", { count: "exact", head: true }).eq("deal_id", dealId)).count || 0,
      }).eq("id", dealId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-buy-deals"] });
      toast.success("🤝 Joined group buy!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useSellerGroupBuy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["seller-group-buy", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("group_buy_deals")
        .select("*, products(title, images), group_buy_participants(count)")
        .eq("seller_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createDeal = useMutation({
    mutationFn: async (deal: any) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("group_buy_deals").insert({ ...deal, seller_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-group-buy"] });
      toast.success("Group buy created!");
    },
  });

  return { deals, isLoading, createDeal };
};

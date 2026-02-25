import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const usePremiumMembership = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: membership, isLoading } = useQuery({
    queryKey: ["premium-membership", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("premium_memberships")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isPremium = membership?.status === "active" && new Date(membership.expires_at) > new Date();

  const subscribe = useMutation({
    mutationFn: async (planType: "monthly" | "yearly") => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Deduct from wallet
      const { data: wallet } = await supabase
        .from("customer_wallets").select("*").eq("customer_id", user.id).maybeSingle();
      
      const price = planType === "monthly" ? 299 : 2499;
      if (!wallet || wallet.balance < price) throw new Error("Insufficient wallet balance. Please top up first.");

      const expiresAt = new Date();
      if (planType === "monthly") expiresAt.setMonth(expiresAt.getMonth() + 1);
      else expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Deduct from wallet
      await supabase.from("customer_wallets").update({
        balance: wallet.balance - price,
        total_spent: wallet.total_spent + price,
      }).eq("customer_id", user.id);

      await supabase.from("customer_wallet_transactions").insert({
        wallet_id: wallet.id, customer_id: user.id, amount: -price,
        transaction_type: "payment", description: `FANZON Plus ${planType} subscription`,
      });

      // Create membership
      const { error } = await supabase.from("premium_memberships").upsert({
        user_id: user.id, plan_type: planType, status: "active",
        price_pkr: price, starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["premium-membership"] });
      queryClient.invalidateQueries({ queryKey: ["customer-wallet"] });
      toast.success("🌟 Welcome to FANZON Plus!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { membership, isPremium, isLoading, subscribe: subscribe.mutateAsync };
};

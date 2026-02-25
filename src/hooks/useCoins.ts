import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useCoins = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["coin-wallet", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("coin_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["coin-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("coin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const earnCoinsMutation = useMutation({
    mutationFn: async ({ amount, type, description, referenceId, referenceType }: {
      amount: number; type: string; description: string; referenceId?: string; referenceType?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Ensure wallet exists
      const { data: existing } = await supabase
        .from("coin_wallets").select("id").eq("user_id", user.id).maybeSingle();
      
      if (!existing) {
        await supabase.from("coin_wallets").insert({ user_id: user.id, balance: 0 });
      }

      // Insert transaction
      await supabase.from("coin_transactions").insert({
        user_id: user.id, amount, transaction_type: type, description,
        reference_id: referenceId, reference_type: referenceType,
      });

      // Update balance
      await supabase.from("coin_wallets").update({
        balance: (existing ? (wallet?.balance || 0) : 0) + amount,
        total_earned: (existing ? (wallet?.total_earned || 0) : 0) + amount,
      }).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["coin-transactions"] });
    },
  });

  const redeemCoinsMutation = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      if (!user?.id || !wallet) throw new Error("Not authenticated");
      if (wallet.balance < amount) throw new Error("Insufficient coins");

      await supabase.from("coin_transactions").insert({
        user_id: user.id, amount: -amount, transaction_type: "redeemed", description,
      });

      await supabase.from("coin_wallets").update({
        balance: wallet.balance - amount,
        total_spent: wallet.total_spent + amount,
      }).eq("user_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["coin-transactions"] });
      toast.success("Coins redeemed successfully!");
    },
  });

  return {
    wallet,
    balance: wallet?.balance || 0,
    transactions,
    isLoading,
    earnCoins: earnCoinsMutation.mutateAsync,
    redeemCoins: redeemCoinsMutation.mutateAsync,
  };
};

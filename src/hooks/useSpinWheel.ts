import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSpinWheel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["spin-wheel-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spin_wheel_config")
        .select("*")
        .eq("is_active", true)
        .order("probability", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: todaySpins = 0 } = useQuery({
    queryKey: ["spin-entries-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("spin_wheel_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("spun_at", today.toISOString());
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please login to spin");
      if (segments.length === 0) throw new Error("No segments configured");

      // Weighted random selection
      const totalProb = segments.reduce((sum, s) => sum + Number(s.probability), 0);
      let random = Math.random() * totalProb;
      let selected = segments[0];
      
      for (const segment of segments) {
        random -= Number(segment.probability);
        if (random <= 0) { selected = segment; break; }
      }

      // Record spin
      const { error } = await supabase.from("spin_wheel_entries").insert({
        user_id: user.id,
        config_id: selected.id,
        reward_type: selected.reward_type,
        reward_value: Number(selected.reward_value),
        reward_label: selected.label,
      });
      if (error) throw error;

      // Award coins if applicable
      if (selected.reward_type === "coins" && Number(selected.reward_value) > 0) {
        const { data: wallet } = await supabase
          .from("coin_wallets").select("*").eq("user_id", user.id).maybeSingle();
        
        if (!wallet) {
          await supabase.from("coin_wallets").insert({
            user_id: user.id, balance: Number(selected.reward_value),
            total_earned: Number(selected.reward_value),
          });
        } else {
          await supabase.from("coin_wallets").update({
            balance: wallet.balance + Number(selected.reward_value),
            total_earned: wallet.total_earned + Number(selected.reward_value),
          }).eq("user_id", user.id);
        }

        await supabase.from("coin_transactions").insert({
          user_id: user.id, amount: Number(selected.reward_value),
          transaction_type: "earned_game", description: `Won ${selected.label} from Spin Wheel`,
          reference_type: "game",
        });
      }

      return selected;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["spin-entries-today"] });
      queryClient.invalidateQueries({ queryKey: ["coin-wallet"] });
      if (result.reward_type !== "nothing") {
        toast.success(`🎉 You won: ${result.label}!`);
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    segments,
    isLoading,
    todaySpins,
    spin: spinMutation.mutateAsync,
    isSpinning: spinMutation.isPending,
    lastResult: spinMutation.data,
  };
};

// Admin hook
export const useAdminSpinWheel = () => {
  const queryClient = useQueryClient();

  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["admin-spin-wheel-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("spin_wheel_config").select("*").order("created_at");
      if (error) throw error;
      return data || [];
    },
  });

  const updateSegment = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("spin_wheel_config").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spin-wheel-config"] });
      toast.success("Segment updated");
    },
  });

  const addSegment = useMutation({
    mutationFn: async (segment: any) => {
      const { error } = await supabase.from("spin_wheel_config").insert(segment);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spin-wheel-config"] });
      toast.success("Segment added");
    },
  });

  const deleteSegment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("spin_wheel_config").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spin-wheel-config"] });
      toast.success("Segment deleted");
    },
  });

  return { segments, isLoading, updateSegment, addSegment, deleteSegment };
};

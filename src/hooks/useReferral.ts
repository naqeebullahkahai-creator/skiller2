import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "FZN-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const useReferralCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: referralCode, isLoading } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createCode = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const code = generateCode();
      const { data, error } = await supabase
        .from("referral_codes")
        .insert({ user_id: user.id, code })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-code"] });
      toast.success("Referral code generated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { referralCode, isLoading, createCode };
};

export const useReferralTracking = () => {
  const { user } = useAuth();

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["referral-tracking", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("referral_tracking")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return { referrals, isLoading };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useOfficialBadges = () => {
  const queryClient = useQueryClient();

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ["official-store-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateBadge = useMutation({
    mutationFn: async ({ userId, badge, isOfficial }: { userId: string; badge: string | null; isOfficial: boolean }) => {
      const { error } = await supabase.from("seller_profiles").update({
        is_official_store: isOfficial,
        official_store_badge: badge,
        official_store_approved_at: isOfficial ? new Date().toISOString() : null,
      }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["official-store-sellers"] });
      toast.success("Badge updated!");
    },
  });

  return { sellers, isLoading, updateBadge };
};

export const useSellerBadge = (sellerId?: string) => {
  const { data: badge } = useQuery({
    queryKey: ["seller-badge", sellerId],
    queryFn: async () => {
      if (!sellerId) return null;
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("is_official_store, official_store_badge")
        .eq("user_id", sellerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sellerId,
  });

  return { isOfficial: badge?.is_official_store || false, badgeType: badge?.official_store_badge };
};

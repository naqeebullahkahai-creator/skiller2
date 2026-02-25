import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useDailyCoupons = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["daily-coupons"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_coupons")
        .select("*")
        .eq("is_active", true)
        .lte("available_date", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: collected = [] } = useQuery({
    queryKey: ["collected-daily-coupons", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("collected_daily_coupons")
        .select("*, daily_coupons(*)")
        .eq("user_id", user.id)
        .eq("is_used", false)
        .gte("expires_at", new Date().toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const collectCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      if (!user?.id) throw new Error("Please login first");
      const coupon = coupons.find((c: any) => c.id === couponId);
      if (!coupon) throw new Error("Coupon not found");

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + coupon.valid_for_hours);

      const { error } = await supabase.from("collected_daily_coupons").insert({
        user_id: user.id,
        coupon_id: couponId,
        expires_at: expiresAt.toISOString(),
      });
      if (error) {
        if (error.code === "23505") throw new Error("Already collected!");
        throw error;
      }

      // Increment collection count
      await supabase.from("daily_coupons").update({
        current_collections: coupon.current_collections + 1,
      }).eq("id", couponId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["collected-daily-coupons"] });
      toast.success("🎫 Coupon collected!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isCollected = (couponId: string) => collected.some((c: any) => c.coupon_id === couponId);

  return { coupons, collected, isLoading, collectCoupon: collectCoupon.mutate, isCollected };
};

export const useAdminDailyCoupons = () => {
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-daily-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_coupons").select("*").order("available_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createCoupon = useMutation({
    mutationFn: async (coupon: any) => {
      const { error } = await supabase.from("daily_coupons").insert(coupon);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-coupons"] });
      toast.success("Coupon created!");
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("daily_coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-daily-coupons"] });
      toast.success("Coupon deleted");
    },
  });

  return { coupons, isLoading, createCoupon: createCoupon.mutate, deleteCoupon: deleteCoupon.mutate };
};

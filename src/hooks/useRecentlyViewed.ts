import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useRecentlyViewed = () => {
  const { user } = useAuth();

  const { data: recentlyViewed = [], isLoading } = useQuery({
    queryKey: ["recently-viewed", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("recently_viewed_products")
        .select(`
          id,
          viewed_at,
          product_id,
          products (
            id, title, price_pkr, discount_price_pkr, images, slug, stock_count, category, brand, seller_id, status
          )
        `)
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r.products,
        viewed_at: r.viewed_at,
      })).filter((p: any) => p && p.status === 'active');
    },
    enabled: !!user?.id,
  });

  const trackView = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("recently_viewed_products")
        .upsert(
          { user_id: user.id, product_id: productId, viewed_at: new Date().toISOString() },
          { onConflict: "user_id,product_id" }
        );
      if (error) console.error("Failed to track view:", error);
    },
  });

  return { recentlyViewed, isLoading, trackView };
};

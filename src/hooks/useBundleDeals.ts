import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useBundleDeals = (sellerId?: string) => {
  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["bundle-deals", sellerId],
    queryFn: async () => {
      let q = supabase.from("bundle_deals").select("*, bundle_items(*, products(*))").eq("is_active", true);
      if (sellerId) q = q.eq("seller_id", sellerId);
      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
  return { bundles, isLoading };
};

export const useSellerBundles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["seller-bundles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("bundle_deals").select("*, bundle_items(*, products(*))").eq("seller_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createBundle = useMutation({
    mutationFn: async ({ bundle, productIds }: { bundle: any; productIds: string[] }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("bundle_deals").insert({ ...bundle, seller_id: user.id }).select().single();
      if (error) throw error;
      if (productIds.length > 0) {
        await supabase.from("bundle_items").insert(productIds.map(pid => ({ bundle_id: data.id, product_id: pid })));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-bundles"] });
      toast.success("Bundle created!");
    },
  });

  const deleteBundle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bundle_deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-bundles"] });
      toast.success("Bundle deleted");
    },
  });

  return { bundles, isLoading, createBundle, deleteBundle };
};

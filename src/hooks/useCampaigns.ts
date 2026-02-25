import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCampaigns = () => {
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: featured = [] } = useQuery({
    queryKey: ["featured-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("starts_at");
      if (error) throw error;
      return data || [];
    },
  });

  return { campaigns, featured, isLoading };
};

export const useCampaignProducts = (campaignId?: string) => {
  return useQuery({
    queryKey: ["campaign-products", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from("campaign_products")
        .select("*, products(*)")
        .eq("campaign_id", campaignId)
        .order("display_order");
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });
};

export const useAdminCampaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: any) => {
      const { error } = await supabase.from("campaigns").insert(campaign);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign created!");
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign updated!");
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign deleted");
    },
  });

  return { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCouriers = () => {
  const { data: couriers = [], isLoading } = useQuery({
    queryKey: ["couriers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couriers").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data || [];
    },
  });

  const getTrackingUrl = (courierCode: string, trackingId: string) => {
    const courier = couriers.find((c: any) => c.code === courierCode);
    if (!courier?.tracking_url_template) return null;
    return courier.tracking_url_template.replace("{tracking_id}", trackingId);
  };

  return { couriers, isLoading, getTrackingUrl };
};

export const useAdminCouriers = () => {
  const queryClient = useQueryClient();

  const { data: couriers = [], isLoading } = useQuery({
    queryKey: ["admin-couriers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("couriers").select("*").order("display_order");
      if (error) throw error;
      return data || [];
    },
  });

  const createCourier = useMutation({
    mutationFn: async (courier: any) => {
      const { error } = await supabase.from("couriers").insert(courier);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success("Courier added!");
    },
  });

  const updateCourier = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("couriers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success("Courier updated!");
    },
  });

  const deleteCourier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("couriers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-couriers"] });
      toast.success("Courier deleted");
    },
  });

  return { couriers, isLoading, createCourier, updateCourier, deleteCourier };
};

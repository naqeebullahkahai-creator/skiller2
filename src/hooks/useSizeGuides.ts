import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSizeGuides = (category?: string) => {
  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["size-guides", category],
    queryFn: async () => {
      let q = supabase.from("size_guides").select("*").eq("is_active", true);
      if (category) q = q.eq("category", category);
      const { data, error } = await q.order("name");
      if (error) throw error;
      return data || [];
    },
  });
  return { guides, isLoading };
};

export const useAdminSizeGuides = () => {
  const queryClient = useQueryClient();

  const { data: guides = [], isLoading } = useQuery({
    queryKey: ["admin-size-guides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("size_guides").select("*").order("category");
      if (error) throw error;
      return data || [];
    },
  });

  const createGuide = useMutation({
    mutationFn: async (guide: any) => {
      const { error } = await supabase.from("size_guides").insert(guide);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      toast.success("Size guide created!");
    },
  });

  const updateGuide = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("size_guides").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      toast.success("Size guide updated");
    },
  });

  const deleteGuide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("size_guides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      toast.success("Size guide deleted");
    },
  });

  return { guides, isLoading, createGuide, updateGuide, deleteGuide };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useInstallmentPlans = () => {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["installment-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installment_plans").select("*").eq("is_active", true).order("months");
      if (error) throw error;
      return data || [];
    },
  });
  return { plans, isLoading };
};

export const useMyInstallments = () => {
  const { user } = useAuth();

  const { data: installments = [], isLoading } = useQuery({
    queryKey: ["my-installments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("installment_orders")
        .select("*, installment_plans(name, months), installment_payments(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return { installments, isLoading };
};

export const useAdminInstallments = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-installments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installment_orders")
        .select("*, installment_plans(name, months), installment_payments(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["admin-installment-plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("installment_plans").select("*").order("months");
      if (error) throw error;
      return data || [];
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { error } = await supabase.from("installment_plans").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-installment-plans"] });
      toast.success("Plan updated");
    },
  });

  return { orders, plans, isLoading, updatePlan };
};

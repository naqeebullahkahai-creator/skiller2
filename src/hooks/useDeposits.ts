import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PaymentMethod {
  id: string;
  method_name: string;
  account_name: string;
  account_number: string | null;
  iban: string | null;
  till_id: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  requester_type: 'customer' | 'seller';
  payment_method_id: string;
  amount: number;
  screenshot_url: string;
  transaction_reference: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  payment_methods?: PaymentMethod;
  profiles?: { full_name: string; email: string };
}

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PaymentMethod[];
    },
  });
};

export const useAdminPaymentMethods = () => {
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['admin-payment-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PaymentMethod[];
    },
  });

  const createMethod = useMutation({
    mutationFn: async (method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(method)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payment method created');
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMethod = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaymentMethod> & { id: string }) => {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payment method updated');
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Payment method deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return {
    paymentMethods,
    isLoading,
    createMethod,
    updateMethod,
    deleteMethod,
  };
};

export const useDepositFeatureEnabled = () => {
  return useQuery({
    queryKey: ['deposit-feature-enabled'],
    queryFn: async () => {
      // Check both admin_settings and site_settings for the deposit toggle
      const { data: adminData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'manual_deposits_enabled')
        .maybeSingle();
      
      // Also check if COD-only mode is active (disables deposits)
      const { data: codData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'cod_only_mode')
        .maybeSingle();
      
      if (codData?.setting_value === 'true') return false; // COD-only disables deposits
      
      // Check admin_settings first, then site_settings fallback
      if (adminData) {
        return adminData.setting_value !== 'false';
      }
      
      const { data: siteData } = await supabase
        .from('site_settings')
        .select('is_enabled')
        .eq('setting_key', 'manual_deposits_enabled')
        .maybeSingle();
      
      return siteData?.is_enabled ?? true;
    },
  });
};

export const useUserDepositRequests = (requesterType: 'customer' | 'seller') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: depositRequests, isLoading } = useQuery({
    queryKey: ['user-deposit-requests', user?.id, requesterType],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*, payment_methods(*)')
        .eq('user_id', user.id)
        .eq('requester_type', requesterType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DepositRequest[];
    },
    enabled: !!user,
  });

  const createDeposit = useMutation({
    mutationFn: async ({
      paymentMethodId,
      amount,
      screenshotUrl,
      transactionReference,
    }: {
      paymentMethodId: string;
      amount: number;
      screenshotUrl: string;
      transactionReference?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('deposit_requests')
        .insert({
          user_id: user.id,
          requester_type: requesterType,
          payment_method_id: paymentMethodId,
          amount,
          screenshot_url: screenshotUrl,
          transaction_reference: transactionReference || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Deposit request submitted! Awaiting admin approval.');
      queryClient.invalidateQueries({ queryKey: ['user-deposit-requests'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });

  return {
    depositRequests,
    isLoading,
    createDeposit,
  };
};

export const useAdminDepositRequests = (requesterType?: 'customer' | 'seller') => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: depositRequests, isLoading } = useQuery({
    queryKey: ['admin-deposit-requests', requesterType],
    queryFn: async () => {
      let query = supabase
        .from('deposit_requests')
        .select('*, payment_methods(*)')
        .order('created_at', { ascending: false });
      
      if (requesterType) {
        query = query.eq('requester_type', requesterType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DepositRequest[];
    },
  });

  const approveDeposit = useMutation({
    mutationFn: async ({ depositId, adminNotes }: { depositId: string; adminNotes?: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('approve_deposit_request', {
        p_deposit_id: depositId,
        p_admin_id: user.id,
        p_admin_notes: adminNotes || null,
      });
      
      if (error) throw error;
      const result = data as { success: boolean; message?: string; amount?: number };
      if (!result?.success) throw new Error(result?.message || 'Failed to approve');
      return result;
    },
    onSuccess: async (_data, variables) => {
      toast.success('Deposit approved and wallet updated');
      queryClient.invalidateQueries({ queryKey: ['admin-deposit-requests'] });

      // Send deposit approved email
      try {
        const { data: deposit } = await supabase
          .from("deposit_requests")
          .select("user_id, amount")
          .eq("id", variables.depositId)
          .single();

        if (deposit) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", deposit.user_id)
            .single();

          if (profile) {
            await supabase.functions.invoke("send-order-emails", {
              body: {
                type: "deposit_approved",
                userEmail: profile.email,
                userName: profile.full_name,
                depositAmount: deposit.amount,
              },
            });
          }
        }
      } catch (emailErr) {
        console.error("Failed to send deposit approval email:", emailErr);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectDeposit = useMutation({
    mutationFn: async ({ depositId, reason }: { depositId: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('reject_deposit_request', {
        p_deposit_id: depositId,
        p_admin_id: user.id,
        p_reason: reason,
      });
      
      if (error) throw error;
      const result = data as { success: boolean; message?: string };
      if (!result?.success) throw new Error(result?.message || 'Failed to reject');
      return result;
    },
    onSuccess: () => {
      toast.success('Deposit rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-deposit-requests'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const pendingCount = depositRequests?.filter(d => d.status === 'pending').length || 0;

  return {
    depositRequests,
    isLoading,
    approveDeposit,
    rejectDeposit,
    pendingCount,
  };
};

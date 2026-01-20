import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayoutRequest } from './useSellerWallet';

interface PayoutWithSeller extends PayoutRequest {
  seller_profiles?: {
    shop_name: string;
    legal_name: string;
  };
}

export const useAdminFinance = () => {
  const queryClient = useQueryClient();

  // Get commission rate
  const { data: commissionRate, isLoading: commissionLoading } = useQuery({
    queryKey: ['admin-commission-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'global_commission_percentage')
        .single();

      if (error) throw error;
      return parseFloat(data.setting_value);
    },
  });

  // Update commission rate
  const updateCommissionRate = useMutation({
    mutationFn: async (newRate: number) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ setting_value: newRate.toString() })
        .eq('setting_key', 'global_commission_percentage')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Commission rate updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-commission-rate'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update commission rate: ${error.message}`);
    },
  });

  // Get all payout requests
  const { data: payoutRequests, isLoading: payoutsLoading } = useQuery({
    queryKey: ['admin-payout-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutRequest[];
    },
  });

  // Get all seller wallets
  const { data: sellerWallets, isLoading: walletsLoading } = useQuery({
    queryKey: ['admin-seller-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_wallets')
        .select('*')
        .order('current_balance', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Process payout
  const processPayout = useMutation({
    mutationFn: async ({ 
      payoutId, 
      transactionReference,
      adminId 
    }: { 
      payoutId: string; 
      transactionReference: string;
      adminId: string;
    }) => {
      const { data, error } = await supabase
        .rpc('process_payout', {
          p_payout_id: payoutId,
          p_transaction_reference: transactionReference,
          p_admin_id: adminId,
        });

      if (error) throw error;
      if (!data) throw new Error('Failed to process payout');
      return data;
    },
    onSuccess: () => {
      toast.success('Payout processed successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-payout-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-seller-wallets'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to process payout: ${error.message}`);
    },
  });

  // Reject payout
  const rejectPayout = useMutation({
    mutationFn: async ({ payoutId, reason }: { payoutId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('payout_requests')
        .update({ 
          status: 'rejected',
          admin_notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payout request rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-payout-requests'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject payout: ${error.message}`);
    },
  });

  const pendingPayoutsCount = payoutRequests?.filter(p => p.status === 'pending').length || 0;
  const totalPendingAmount = payoutRequests
    ?.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return {
    commissionRate,
    commissionLoading,
    updateCommissionRate,
    payoutRequests,
    payoutsLoading,
    sellerWallets,
    walletsLoading,
    processPayout,
    rejectPayout,
    pendingPayoutsCount,
    totalPendingAmount,
  };
};

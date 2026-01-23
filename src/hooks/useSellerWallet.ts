import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SellerWallet {
  id: string;
  seller_id: string;
  current_balance: number;
  total_earnings: number;
  total_withdrawn: number;
  pending_clearance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  seller_id: string;
  order_id: string | null;
  transaction_type: 'earning' | 'commission_deduction' | 'withdrawal' | 'refund_deduction' | 'adjustment';
  gross_amount: number;
  commission_amount: number;
  commission_percentage: number;
  net_amount: number;
  description: string | null;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  seller_id: string;
  wallet_id: string;
  amount: number;
  bank_name: string;
  account_title: string;
  iban: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transaction_reference: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const useSellerWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['seller-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('seller_wallets')
        .select('*')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as SellerWallet | null;
    },
    enabled: !!user?.id,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!user?.id,
  });

  const { data: payoutRequests, isLoading: payoutsLoading } = useQuery({
    queryKey: ['payout-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutRequest[];
    },
    enabled: !!user?.id,
  });

  const requestPayout = useMutation({
    mutationFn: async ({ amount, bankDetails }: { 
      amount: number; 
      bankDetails: { bank_name: string; account_title: string; iban: string };
    }) => {
      if (!user?.id || !wallet?.id) throw new Error('Wallet not found');

      if (amount < 1000) {
        throw new Error('Minimum payout amount is Rs. 1,000');
      }

      if (amount > (wallet?.current_balance || 0)) {
        throw new Error('Insufficient balance');
      }

      const { data, error } = await supabase
        .from('payout_requests')
        .insert({
          seller_id: user.id,
          wallet_id: wallet.id,
          amount,
          bank_name: bankDetails.bank_name,
          account_title: bankDetails.account_title,
          iban: bankDetails.iban,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Payout request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['payout-requests', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const canRequestPayout = (wallet?.current_balance || 0) >= 1000;
  const hasPendingPayout = payoutRequests?.some(p => p.status === 'pending');

  return {
    wallet,
    transactions,
    payoutRequests,
    isLoading: walletLoading || transactionsLoading || payoutsLoading,
    requestPayout,
    canRequestPayout,
    hasPendingPayout,
  };
};

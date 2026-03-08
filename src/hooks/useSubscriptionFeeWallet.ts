import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionFeeWallet {
  id: string;
  total_balance: number;
  total_earned: number;
  total_sellers_paid: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFeeTransaction {
  id: string;
  seller_id: string;
  seller_name: string | null;
  plan_type: string;
  amount: number;
  status: string;
  deduction_log_id: string | null;
  created_at: string;
}

export const useSubscriptionFeeWallet = () => {
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['subscription-fee-wallet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_fee_wallet' as any)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as unknown as SubscriptionFeeWallet | null;
    },
  });

  const { data: transactions, isLoading: txnLoading } = useQuery({
    queryKey: ['subscription-fee-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_fee_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as SubscriptionFeeTransaction[];
    },
  });

  // Also fetch all seller subscriptions for who paid/didn't pay view
  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['all-seller-subscriptions-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_subscriptions' as any)
        .select('*')
        .order('next_deduction_at', { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Fetch seller names
  const { data: sellerProfiles } = useQuery({
    queryKey: ['seller-profiles-for-subs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      if (error) throw error;
      return (data || []) as { id: string; full_name: string; email: string }[];
    },
  });

  const getSellerName = (sellerId: string) => {
    return sellerProfiles?.find(p => p.id === sellerId)?.full_name || 'Unknown Seller';
  };

  const paidSellers = subscriptions?.filter(s => !s.payment_pending && !s.account_suspended && s.is_active) || [];
  const unpaidSellers = subscriptions?.filter(s => s.payment_pending || s.account_suspended) || [];
  const freePeriodSellers = subscriptions?.filter(s => s.is_in_free_period) || [];

  const exportCSV = () => {
    if (!transactions?.length) return;
    const headers = ['Date', 'Seller', 'Plan', 'Amount', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.seller_name || '',
      t.plan_type,
      t.amount.toString(),
      t.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `subscription-fees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return {
    wallet, walletLoading,
    transactions, txnLoading,
    subscriptions, subsLoading,
    paidSellers, unpaidSellers, freePeriodSellers,
    getSellerName,
    exportCSV,
  };
};

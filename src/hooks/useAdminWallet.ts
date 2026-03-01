import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AdminWallet {
  id: string;
  total_balance: number;
  total_subscription_earnings: number;
  total_commission_earnings: number;
  pin_set: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminWalletTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  seller_id: string | null;
  description: string | null;
  created_at: string;
}

export const useAdminWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['admin-wallet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_wallet' as any)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as unknown as AdminWallet | null;
    },
  });

  const { data: transactions, isLoading: txnLoading } = useQuery({
    queryKey: ['admin-wallet-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_wallet_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as AdminWalletTransaction[];
    },
  });

  const setPin = useMutation({
    mutationFn: async (pin: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('set_admin_wallet_pin', {
        p_admin_id: user.id, p_pin: pin,
      });
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data) => {
      if (data?.success) { toast.success('PIN set successfully'); queryClient.invalidateQueries({ queryKey: ['admin-wallet'] }); }
      else toast.error(data?.message || 'Failed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verifyPin = useMutation({
    mutationFn: async (pin: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('verify_admin_wallet_pin', {
        p_admin_id: user.id, p_pin: pin,
      });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (result) => {
      if (!result) toast.error('Invalid PIN. Please try again.');
    },
  });

  // Export transactions as CSV
  const exportCSV = () => {
    if (!transactions?.length) return;
    const headers = ['Date', 'Type', 'Amount', 'Description'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.transaction_type,
      t.amount.toString(),
      t.description || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `admin-wallet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return {
    wallet, walletLoading,
    transactions, txnLoading,
    setPin, verifyPin, exportCSV,
    isPinSet: wallet?.pin_set ?? false,
  };
};

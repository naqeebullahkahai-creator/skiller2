import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CommissionWallet {
  id: string;
  total_balance: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionTransaction {
  id: string;
  product_id: string | null;
  order_id: string | null;
  seller_id: string;
  commission_type: string;
  commission_value: number;
  sale_amount: number;
  commission_amount: number;
  product_title: string | null;
  seller_name: string | null;
  created_at: string;
}

export interface ProductCommission {
  id: string;
  product_id: string;
  seller_id: string;
  commission_type: 'percentage' | 'fixed';
  commission_value: number;
  set_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useCommissionWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['commission-wallet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_wallet' as any)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data as unknown as CommissionWallet | null;
    },
  });

  const { data: transactions, isLoading: txnLoading } = useQuery({
    queryKey: ['commission-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as CommissionTransaction[];
    },
  });

  const setProductCommission = useMutation({
    mutationFn: async ({ 
      productId, sellerId, commissionType, commissionValue 
    }: { 
      productId: string; sellerId: string; commissionType: 'percentage' | 'fixed'; commissionValue: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('product_commissions' as any)
        .upsert({
          product_id: productId,
          seller_id: sellerId,
          commission_type: commissionType,
          commission_value: commissionValue,
          set_by: user.id,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'product_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Product commission set successfully');
      queryClient.invalidateQueries({ queryKey: ['product-commissions'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCSV = () => {
    if (!transactions?.length) return;
    const headers = ['Date', 'Product', 'Seller', 'Type', 'Rate/Amount', 'Sale Amount', 'Commission'];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.product_title || '',
      t.seller_name || '',
      t.commission_type,
      t.commission_value.toString(),
      t.sale_amount.toString(),
      t.commission_amount.toString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `commission-wallet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return {
    wallet, walletLoading,
    transactions, txnLoading,
    setProductCommission,
    exportCSV,
  };
};

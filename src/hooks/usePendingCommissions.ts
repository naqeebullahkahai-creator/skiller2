import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface OrderSettlement {
  id: string;
  order_id: string;
  seller_id: string;
  product_id: string | null;
  product_title: string | null;
  order_amount: number;
  commission_type: string;
  commission_value: number;
  commission_amount: number;
  seller_payout: number;
  status: string;
  settled_at: string | null;
  settled_by: string | null;
  tracking_id: string | null;
  courier_name: string | null;
  created_at: string;
  updated_at: string;
}

export const usePendingCommissions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settlements = [], isLoading, refetch } = useQuery({
    queryKey: ['order-settlements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_settlements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []) as OrderSettlement[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('order-settlements-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_settlements',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['order-settlements'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const settledSettlements = settlements.filter(s => s.status === 'settled');

  const settleCommission = useMutation({
    mutationFn: async (settlementId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('settle_order_commission', {
        p_settlement_id: settlementId,
        p_admin_id: user.id,
      });
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(`Commission settled! Seller paid Rs. ${data.seller_payout}`);
        queryClient.invalidateQueries({ queryKey: ['order-settlements'] });
        queryClient.invalidateQueries({ queryKey: ['commission-wallet'] });
        queryClient.invalidateQueries({ queryKey: ['admin-wallet'] });
      } else {
        toast.error(data?.message || 'Failed to settle');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkSettle = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      const results = [];
      for (const id of ids) {
        const { data, error } = await supabase.rpc('settle_order_commission', {
          p_settlement_id: id,
          p_admin_id: user.id,
        });
        if (error) throw error;
        results.push(data);
      }
      return results;
    },
    onSuccess: () => {
      toast.success('All selected commissions settled!');
      queryClient.invalidateQueries({ queryKey: ['order-settlements'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return {
    settlements,
    pendingSettlements,
    settledSettlements,
    isLoading,
    refetch,
    settleCommission,
    bulkSettle,
  };
};

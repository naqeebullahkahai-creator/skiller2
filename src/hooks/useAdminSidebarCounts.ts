import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface SidebarCounts {
  pendingOrders: number;
  pendingKyc: number;
  pendingApprovals: number;
  pendingSellerDeposits: number;
  pendingCustomerDeposits: number;
  pendingCommissions: number;
  pendingReturns: number;
  pendingNominations: number;
  cancelledOrders: number;
}

const defaultCounts: SidebarCounts = {
  pendingOrders: 0, pendingKyc: 0, pendingApprovals: 0,
  pendingSellerDeposits: 0, pendingCustomerDeposits: 0,
  pendingCommissions: 0, pendingReturns: 0,
  pendingNominations: 0, cancelledOrders: 0,
};

export const useAdminSidebarCounts = () => {
  const { data: counts, refetch } = useQuery({
    queryKey: ['admin-sidebar-counts'],
    queryFn: async (): Promise<SidebarCounts> => {
      const results = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('order_status', ['pending', 'processing'] as any[]),
        supabase.from('seller_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending' as any),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending' as any),
        supabase.from('deposit_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending' as any).eq('requester_type', 'seller' as any),
        supabase.from('deposit_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending' as any).eq('requester_type', 'customer' as any),
        supabase.from('order_settlements').select('id', { count: 'exact', head: true }).eq('status', 'pending' as any),
        supabase.from('return_requests').select('id', { count: 'exact', head: true }).in('status', ['return_requested', 'approved'] as any[]),
        supabase.from('flash_sale_nominations').select('id', { count: 'exact', head: true }).eq('status', 'pending' as any),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'cancelled' as any),
      ]);

      return {
        pendingOrders: results[0].count ?? 0,
        pendingKyc: results[1].count ?? 0,
        pendingApprovals: results[2].count ?? 0,
        pendingSellerDeposits: results[3].count ?? 0,
        pendingCustomerDeposits: results[4].count ?? 0,
        pendingCommissions: results[5].count ?? 0,
        pendingReturns: results[6].count ?? 0,
        pendingNominations: results[7].count ?? 0,
        cancelledOrders: results[8].count ?? 0,
      };
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('sidebar-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_profiles' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposit_requests' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_settlements' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flash_sale_nominations' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return counts ?? defaultCounts;
};

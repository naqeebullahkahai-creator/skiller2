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
  pendingPayouts: number;
  pendingWithdrawals: number;
}

const defaultCounts: SidebarCounts = {
  pendingOrders: 0, pendingKyc: 0, pendingApprovals: 0,
  pendingSellerDeposits: 0, pendingCustomerDeposits: 0,
  pendingCommissions: 0, pendingReturns: 0,
  pendingNominations: 0, pendingPayouts: 0, pendingWithdrawals: 0,
};

async function fetchCount(table: string, filters: Record<string, any> = {}, inFilters: Record<string, any[]> = {}): Promise<number> {
  let query = supabase.from(table as any).select('id', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value) as any;
  }
  for (const [key, values] of Object.entries(inFilters)) {
    query = query.in(key, values) as any;
  }
  const { count } = await query;
  return count ?? 0;
}

export const useAdminSidebarCounts = () => {
  const { data: counts, refetch } = useQuery({
    queryKey: ['admin-sidebar-counts'],
    queryFn: async (): Promise<SidebarCounts> => {
      const [
        pendingOrders, pendingKyc, pendingApprovals,
        pendingSellerDeposits, pendingCustomerDeposits,
        pendingCommissions, pendingReturns, pendingNominations,
        pendingPayouts, pendingWithdrawals,
      ] = await Promise.all([
        fetchCount('orders', {}, { order_status: ['pending', 'processing'] }),
        fetchCount('seller_profiles', { verification_status: 'pending' }),
        fetchCount('products', { approval_status: 'pending' }),
        fetchCount('deposit_requests', { status: 'pending', requester_type: 'seller' }),
        fetchCount('deposit_requests', { status: 'pending', requester_type: 'customer' }),
        fetchCount('order_settlements', { status: 'pending' }),
        fetchCount('return_requests', {}, { status: ['return_requested', 'approved'] }),
        fetchCount('flash_sale_nominations', { status: 'pending' }),
        fetchCount('agent_payouts', { status: 'pending' }),
        fetchCount('payout_requests', { status: 'pending' }),
      ]);

      return {
        pendingOrders, pendingKyc, pendingApprovals,
        pendingSellerDeposits, pendingCustomerDeposits,
        pendingCommissions, pendingReturns, pendingNominations,
        pendingPayouts, pendingWithdrawals,
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_payouts' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return counts ?? defaultCounts;
};

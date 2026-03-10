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

export const useAdminSidebarCounts = () => {
  const { data: counts, refetch } = useQuery({
    queryKey: ['admin-sidebar-counts'],
    queryFn: async (): Promise<SidebarCounts> => {
      const [
        ordersRes,
        kycRes,
        approvalsRes,
        sellerDepositsRes,
        customerDepositsRes,
        commissionsRes,
        returnsRes,
        nominationsRes,
        cancelledRes,
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('order_status', ['pending', 'processing']),
        supabase.from('seller_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('deposit_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq('requester_type', 'seller'),
        supabase.from('deposit_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq('requester_type', 'customer'),
        supabase.from('order_settlements').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('return_requests').select('id', { count: 'exact', head: true }).in('status', ['return_requested', 'approved'] as any),
        supabase.from('flash_sale_nominations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'cancelled'),
      ]);

      return {
        pendingOrders: ordersRes.count ?? 0,
        pendingKyc: kycRes.count ?? 0,
        pendingApprovals: approvalsRes.count ?? 0,
        pendingSellerDeposits: sellerDepositsRes.count ?? 0,
        pendingCustomerDeposits: customerDepositsRes.count ?? 0,
        pendingCommissions: commissionsRes.count ?? 0,
        pendingReturns: returnsRes.count ?? 0,
        pendingNominations: nominationsRes.count ?? 0,
        cancelledOrders: cancelledRes.count ?? 0,
      };
    },
    refetchInterval: 30000, // 30 sec auto-refresh
  });

  // Realtime listeners for key tables
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

  return counts ?? {
    pendingOrders: 0,
    pendingKyc: 0,
    pendingApprovals: 0,
    pendingSellerDeposits: 0,
    pendingCustomerDeposits: 0,
    pendingCommissions: 0,
    pendingReturns: 0,
    pendingNominations: 0,
    cancelledOrders: 0,
  };
};

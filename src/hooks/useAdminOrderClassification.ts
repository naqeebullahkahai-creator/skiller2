import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from './useOrders';

/**
 * Fetches admin user IDs from user_roles to distinguish
 * "Direct Store" orders (admin-owned products) from "Vendor" orders.
 * Includes real-time subscription for instant updates.
 */
export const useAdminOrderClassification = () => {
  const queryClient = useQueryClient();

  // Get all admin user IDs
  const adminIdsQuery = useQuery({
    queryKey: ['admin-user-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      if (error) throw error;
      return new Set((data || []).map(r => r.user_id));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all orders
  const ordersQuery = useQuery({
    queryKey: ['admin-classified-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((order: any) => ({
        ...order,
        items: (Array.isArray(order.items) ? order.items : []) as OrderItem[],
      })) as Order[];
    },
    staleTime: 10000,
  });

  // Real-time subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          queryClient.setQueryData<Order[]>(['admin-classified-orders'], (old) => {
            if (!old) return old;

            if (payload.eventType === 'INSERT') {
              const newOrder = {
                ...payload.new,
                items: (Array.isArray(payload.new.items) ? payload.new.items : []) as OrderItem[],
              } as Order;
              return [newOrder, ...old];
            }

            if (payload.eventType === 'UPDATE') {
              return old.map((order) =>
                order.id === payload.new.id
                  ? {
                      ...order,
                      ...payload.new,
                      items: (Array.isArray(payload.new.items) ? payload.new.items : order.items) as OrderItem[],
                    }
                  : order
              );
            }

            if (payload.eventType === 'DELETE') {
              return old.filter((order) => order.id !== payload.old.id);
            }

            return old;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const adminIds = adminIdsQuery.data || new Set<string>();
  const allOrders = ordersQuery.data || [];

  const directOrders = allOrders.filter(order =>
    order.items.length > 0 && order.items.some(item => adminIds.has(item.seller_id))
  );

  const vendorOrders = allOrders.filter(order =>
    order.items.length > 0 && order.items.some(item => !adminIds.has(item.seller_id))
  );

  const calcRevenue = (orders: Order[], filterFn: (item: OrderItem) => boolean) => {
    let total = 0;
    for (const order of orders) {
      if (order.order_status === 'delivered') {
        for (const item of order.items) {
          if (filterFn(item)) {
            total += item.price_pkr * item.quantity;
          }
        }
      }
    }
    return total;
  };

  const directRevenue = calcRevenue(allOrders, item => adminIds.has(item.seller_id));
  const vendorRevenue = calcRevenue(allOrders, item => !adminIds.has(item.seller_id));

  return {
    directOrders,
    vendorOrders,
    directRevenue,
    vendorRevenue,
    totalRevenue: directRevenue + vendorRevenue,
    isLoading: adminIdsQuery.isLoading || ordersQuery.isLoading,
    refetch: () => {
      adminIdsQuery.refetch();
      ordersQuery.refetch();
    },
  };
};

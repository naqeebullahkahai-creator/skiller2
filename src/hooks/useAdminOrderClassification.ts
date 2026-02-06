import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from './useOrders';

/**
 * Fetches admin user IDs from user_roles to distinguish
 * "Direct Store" orders (admin-owned products) from "Vendor" orders.
 */
export const useAdminOrderClassification = () => {
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
    staleTime: 30000,
  });

  const adminIds = adminIdsQuery.data || new Set<string>();
  const allOrders = ordersQuery.data || [];

  // Classify: an order is "direct" if ALL its items belong to admin sellers
  // "vendor" if ALL items belong to non-admin sellers
  // Mixed orders appear in both views
  const directOrders = allOrders.filter(order =>
    order.items.length > 0 && order.items.some(item => adminIds.has(item.seller_id))
  );

  const vendorOrders = allOrders.filter(order =>
    order.items.length > 0 && order.items.some(item => !adminIds.has(item.seller_id))
  );

  // Revenue calculations
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

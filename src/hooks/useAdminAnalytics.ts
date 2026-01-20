import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  commission: number;
  label: string;
}

interface TopSeller {
  id: string;
  shop_name: string;
  legal_name: string;
  total_revenue: number;
  total_orders: number;
}

interface TopCategory {
  category: string;
  total_sales: number;
  product_count: number;
}

interface UserGrowthPoint {
  month: string;
  customers: number;
  sellers: number;
  label: string;
}

export const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

export const useAdminAnalytics = () => {
  // Get all wallet transactions for revenue data
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['admin-analytics-transactions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: true });

      return data || [];
    },
  });

  // Get all orders for order analytics
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-analytics-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      return data || [];
    },
  });

  // Get order items with seller info
  const { data: orderItemsData, isLoading: orderItemsLoading } = useQuery({
    queryKey: ['admin-analytics-order-items'],
    queryFn: async () => {
      const { data } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner (
            order_status,
            created_at
          )
        `);

      return data || [];
    },
  });

  // Get all products for category analysis
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-analytics-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, category, price_pkr, seller_id, status')
        .eq('status', 'active');

      return data || [];
    },
  });

  // Get seller profiles
  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['admin-analytics-sellers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('seller_profiles')
        .select('id, user_id, shop_name, legal_name, verification_status');

      return data || [];
    },
  });

  // Get user roles for growth chart
  const { data: userRolesData, isLoading: userRolesLoading } = useQuery({
    queryKey: ['admin-analytics-user-roles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('id, role, created_at')
        .order('created_at', { ascending: true });

      return data || [];
    },
  });

  // Get profiles for user stats
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ['admin-analytics-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, created_at');

      return data || [];
    },
  });

  // Calculate total platform revenue and commission
  const platformStats = useMemo(() => {
    if (!transactionsData) return { totalRevenue: 0, totalCommission: 0, totalPayouts: 0 };

    const earnings = transactionsData.filter(t => t.transaction_type === 'earning');
    const totalGrossRevenue = earnings.reduce((sum, t) => sum + Number(t.gross_amount), 0);
    const totalCommission = earnings.reduce((sum, t) => sum + Number(t.commission_amount), 0);
    const totalPayouts = transactionsData
      .filter(t => t.transaction_type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(Number(t.net_amount)), 0);

    return {
      totalRevenue: totalGrossRevenue,
      totalCommission,
      totalPayouts,
    };
  }, [transactionsData]);

  // Revenue chart data (daily for last 30 days)
  const revenueChartData = useMemo((): RevenueDataPoint[] => {
    if (!transactionsData) return [];

    const earnings = transactionsData.filter(t => t.transaction_type === 'earning');
    const now = new Date();
    const last30Days: RevenueDataPoint[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = earnings.filter(t => t.created_at.startsWith(dateStr));
      const dayRevenue = dayTransactions.reduce((sum, t) => sum + Number(t.gross_amount), 0);
      const dayCommission = dayTransactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);

      last30Days.push({
        date: dateStr,
        revenue: dayRevenue,
        commission: dayCommission,
        label: date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
      });
    }

    return last30Days;
  }, [transactionsData]);

  // Top performing sellers
  const topSellers = useMemo((): TopSeller[] => {
    if (!orderItemsData || !sellersData) return [];

    const sellerStats: Record<string, { revenue: number; orders: Set<string> }> = {};

    orderItemsData.forEach(item => {
      const order = item.orders as any;
      if (order?.order_status === 'delivered') {
        if (!sellerStats[item.seller_id]) {
          sellerStats[item.seller_id] = { revenue: 0, orders: new Set() };
        }
        sellerStats[item.seller_id].revenue += Number(item.price_pkr) * item.quantity;
        sellerStats[item.seller_id].orders.add(item.order_id);
      }
    });

    const sellerMap = Object.fromEntries(
      sellersData.map(s => [s.user_id, { shop_name: s.shop_name, legal_name: s.legal_name }])
    );

    return Object.entries(sellerStats)
      .map(([sellerId, stats]) => ({
        id: sellerId,
        shop_name: sellerMap[sellerId]?.shop_name || 'Unknown Shop',
        legal_name: sellerMap[sellerId]?.legal_name || 'Unknown',
        total_revenue: stats.revenue,
        total_orders: stats.orders.size,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);
  }, [orderItemsData, sellersData]);

  // Top performing categories
  const topCategories = useMemo((): TopCategory[] => {
    if (!orderItemsData || !productsData) return [];

    const productCategories = Object.fromEntries(
      productsData.map(p => [p.id, p.category])
    );

    const categoryStats: Record<string, { sales: number; products: Set<string> }> = {};

    orderItemsData.forEach(item => {
      const order = item.orders as any;
      if (order?.order_status === 'delivered') {
        const category = productCategories[item.product_id] || 'Other';
        if (!categoryStats[category]) {
          categoryStats[category] = { sales: 0, products: new Set() };
        }
        categoryStats[category].sales += Number(item.price_pkr) * item.quantity;
        categoryStats[category].products.add(item.product_id);
      }
    });

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        total_sales: stats.sales,
        product_count: stats.products.size,
      }))
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, 10);
  }, [orderItemsData, productsData]);

  // User growth chart (monthly)
  const userGrowthData = useMemo((): UserGrowthPoint[] => {
    if (!userRolesData) return [];

    const monthlyStats: Record<string, { customers: number; sellers: number }> = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[monthKey] = { customers: 0, sellers: 0 };
    }

    userRolesData.forEach(role => {
      const date = new Date(role.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyStats[monthKey]) {
        if (role.role === 'customer') {
          monthlyStats[monthKey].customers++;
        } else if (role.role === 'seller') {
          monthlyStats[monthKey].sellers++;
        }
      }
    });

    return Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        customers: stats.customers,
        sellers: stats.sellers,
        label: new Date(month + '-01').toLocaleDateString('en-PK', { month: 'short', year: '2-digit' })
      }));
  }, [userRolesData]);

  // Order statistics
  const orderStats = useMemo(() => {
    if (!ordersData) return { total: 0, pending: 0, delivered: 0, cancelled: 0 };

    return {
      total: ordersData.length,
      pending: ordersData.filter(o => o.order_status === 'pending').length,
      delivered: ordersData.filter(o => o.order_status === 'delivered').length,
      cancelled: ordersData.filter(o => o.order_status === 'cancelled').length,
    };
  }, [ordersData]);

  // User statistics
  const userStats = useMemo(() => {
    if (!userRolesData) return { totalUsers: 0, customers: 0, sellers: 0, admins: 0 };

    return {
      totalUsers: userRolesData.length,
      customers: userRolesData.filter(r => r.role === 'customer').length,
      sellers: userRolesData.filter(r => r.role === 'seller').length,
      admins: userRolesData.filter(r => r.role === 'admin').length,
    };
  }, [userRolesData]);

  return {
    platformStats,
    revenueChartData,
    topSellers,
    topCategories,
    userGrowthData,
    orderStats,
    userStats,
    isLoading: transactionsLoading || ordersLoading || orderItemsLoading || 
               productsLoading || sellersLoading || userRolesLoading || profilesLoading,
  };
};

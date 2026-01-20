import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface EarningsDataPoint {
  date: string;
  earnings: number;
  label: string;
}

interface OrderStatusDistribution {
  status: string;
  count: number;
  color: string;
}

interface TopProduct {
  id: string;
  title: string;
  image_url: string | null;
  total_sold: number;
  total_revenue: number;
}

interface LowStockProduct {
  id: string;
  title: string;
  stock_count: number;
  image_url: string | null;
}

interface ProductReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  product_title: string;
}

export const formatPKR = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

export const useSellerAnalytics = () => {
  const { user } = useAuth();

  // Get seller's wallet transactions for earnings data
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['seller-wallet-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: wallet, error: walletError } = await supabase
        .from('seller_wallets')
        .select('*')
        .eq('seller_id', user.id)
        .single();

      if (walletError) return null;

      const { data: transactions } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('seller_id', user.id)
        .eq('transaction_type', 'earning')
        .order('created_at', { ascending: true });

      return { wallet, transactions: transactions || [] };
    },
    enabled: !!user?.id,
  });

  // Get orders data for the seller
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get order items for this seller
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          price_pkr,
          quantity,
          product_id,
          title,
          orders!inner (
            order_status,
            created_at,
            customer_id
          )
        `)
        .eq('seller_id', user.id);

      return orderItems || [];
    },
    enabled: !!user?.id,
  });

  // Get products for top sellers and low stock
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: products } = await supabase
        .from('products')
        .select('id, title, stock_count, images, status')
        .eq('seller_id', user.id)
        .eq('status', 'active');

      return products || [];
    },
    enabled: !!user?.id,
  });

  // Get product reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['seller-reviews-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get seller's products first
      const { data: products } = await supabase
        .from('products')
        .select('id, title')
        .eq('seller_id', user.id);

      if (!products || products.length === 0) return [];

      const productIds = products.map(p => p.id);
      const productMap = Object.fromEntries(products.map(p => [p.id, p.title]));

      const { data: reviews } = await supabase
        .from('product_reviews')
        .select('id, rating, review_text, created_at, product_id')
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
        .limit(10);

      return (reviews || []).map(r => ({
        ...r,
        product_title: productMap[r.product_id] || 'Unknown Product'
      }));
    },
    enabled: !!user?.id,
  });

  // Calculate earnings chart data (daily for last 30 days or weekly/monthly)
  const earningsChartData = useMemo((): EarningsDataPoint[] => {
    if (!walletData?.transactions) return [];

    const transactions = walletData.transactions;
    const now = new Date();
    const last30Days: EarningsDataPoint[] = [];

    // Group by day for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEarnings = transactions
        .filter(t => t.created_at.startsWith(dateStr))
        .reduce((sum, t) => sum + Number(t.net_amount), 0);

      last30Days.push({
        date: dateStr,
        earnings: dayEarnings,
        label: date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
      });
    }

    return last30Days;
  }, [walletData]);

  // Calculate order status distribution
  const orderStatusDistribution = useMemo((): OrderStatusDistribution[] => {
    if (!ordersData || ordersData.length === 0) return [];

    const statusCounts: Record<string, number> = {};
    ordersData.forEach(item => {
      const status = (item.orders as any)?.order_status || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      pending: 'hsl(38, 92%, 50%)',
      processing: 'hsl(217, 91%, 60%)',
      shipped: 'hsl(270, 70%, 60%)',
      delivered: 'hsl(142, 71%, 45%)',
      cancelled: 'hsl(0, 84%, 60%)',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: statusColors[status] || 'hsl(220, 9%, 46%)',
    }));
  }, [ordersData]);

  // Calculate top selling products
  const topProducts = useMemo((): TopProduct[] => {
    if (!ordersData || ordersData.length === 0) return [];

    const productStats: Record<string, { 
      id: string; 
      title: string; 
      totalSold: number; 
      totalRevenue: number;
    }> = {};

    ordersData.forEach(item => {
      const order = item.orders as any;
      if (order?.order_status === 'delivered') {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            id: item.product_id,
            title: item.title,
            totalSold: 0,
            totalRevenue: 0,
          };
        }
        productStats[item.product_id].totalSold += item.quantity;
        productStats[item.product_id].totalRevenue += Number(item.price_pkr) * item.quantity;
      }
    });

    return Object.values(productStats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        image_url: null,
        total_sold: p.totalSold,
        total_revenue: p.totalRevenue,
      }));
  }, [ordersData]);

  // Get low stock products (less than 5 units)
  const lowStockProducts = useMemo((): LowStockProduct[] => {
    if (!productsData) return [];

    return productsData
      .filter(p => p.stock_count < 5)
      .map(p => ({
        id: p.id,
        title: p.title,
        stock_count: p.stock_count,
        image_url: p.images?.[0] || null,
      }))
      .sort((a, b) => a.stock_count - b.stock_count);
  }, [productsData]);

  // Calculate repeat customer percentage
  const repeatCustomerStats = useMemo(() => {
    if (!ordersData || ordersData.length === 0) return { percentage: 0, total: 0, repeat: 0 };

    const customerOrders: Record<string, number> = {};
    ordersData.forEach(item => {
      const customerId = (item.orders as any)?.customer_id;
      if (customerId) {
        customerOrders[customerId] = (customerOrders[customerId] || 0) + 1;
      }
    });

    const totalCustomers = Object.keys(customerOrders).length;
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;

    return {
      percentage: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      total: totalCustomers,
      repeat: repeatCustomers,
    };
  }, [ordersData]);

  // Recent reviews with product names
  const recentReviews = useMemo((): ProductReview[] => {
    return reviewsData || [];
  }, [reviewsData]);

  // Total stats
  const totalStats = useMemo(() => {
    const totalEarnings = walletData?.wallet?.total_earnings || 0;
    const totalOrders = new Set(ordersData?.map(item => item.order_id)).size;
    const deliveredOrders = ordersData?.filter(item => (item.orders as any)?.order_status === 'delivered').length || 0;
    const avgOrderValue = deliveredOrders > 0 
      ? totalEarnings / deliveredOrders 
      : 0;

    return {
      totalEarnings,
      totalOrders,
      deliveredOrders,
      avgOrderValue,
    };
  }, [walletData, ordersData]);

  return {
    earningsChartData,
    orderStatusDistribution,
    topProducts,
    lowStockProducts,
    repeatCustomerStats,
    recentReviews,
    totalStats,
    isLoading: walletLoading || ordersLoading || productsLoading || reviewsLoading,
  };
};

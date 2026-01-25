import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SellerPerformanceData {
  // Sales metrics
  totalSales: number;
  salesByMonth: { month: string; sales: number; orders: number }[];
  
  // Order fulfillment
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  fulfillmentRate: number;
  
  // Ratings
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { stars: number; count: number }[];
  
  // Top products
  topProducts: { id: string; title: string; sales: number; image: string | null }[];
}

export const useSellerPerformance = (sellerId: string) => {
  const { data: performance, isLoading } = useQuery({
    queryKey: ["seller-performance", sellerId],
    queryFn: async (): Promise<SellerPerformanceData> => {
      if (!sellerId) {
        return getEmptyPerformance();
      }

      // Get all orders containing this seller's products
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter orders for this seller
      const sellerOrders = allOrders?.filter(order => {
        const items = order.items as any[];
        return items?.some(item => item.seller_id === sellerId);
      }) || [];

      // Calculate sales by month (last 6 months)
      const salesByMonth: { month: string; sales: number; orders: number }[] = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        
        const monthOrders = sellerOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthDate && orderDate <= monthEnd;
        });

        const monthSales = monthOrders.reduce((sum, order) => {
          const items = order.items as any[];
          const sellerItems = items?.filter(item => item.seller_id === sellerId) || [];
          return sum + sellerItems.reduce((itemSum, item) => 
            itemSum + (Number(item.price_pkr || 0) * (item.quantity || 1)), 0);
        }, 0);

        salesByMonth.push({
          month: monthName,
          sales: monthSales,
          orders: monthOrders.length,
        });
      }

      // Calculate total sales
      const totalSales = salesByMonth.reduce((sum, m) => sum + m.sales, 0);
      
      // Order status breakdown
      const deliveredOrders = sellerOrders.filter(o => o.order_status === 'delivered').length;
      const cancelledOrders = sellerOrders.filter(o => o.order_status === 'cancelled').length;
      
      // Get returns for this seller
      const { data: returns } = await supabase
        .from("return_requests")
        .select("*")
        .eq("seller_id", sellerId);
      
      const returnedOrders = returns?.length || 0;
      
      const totalOrders = sellerOrders.length;
      const fulfillmentRate = totalOrders > 0 
        ? Math.round((deliveredOrders / totalOrders) * 100) 
        : 0;

      // Get reviews for seller's products
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("seller_id", sellerId);
      
      const productIds = products?.map(p => p.id) || [];
      
      let averageRating = 0;
      let totalReviews = 0;
      let ratingBreakdown: { stars: number; count: number }[] = [
        { stars: 5, count: 0 },
        { stars: 4, count: 0 },
        { stars: 3, count: 0 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ];

      if (productIds.length > 0) {
        const { data: reviews } = await supabase
          .from("product_reviews")
          .select("rating")
          .in("product_id", productIds);

        if (reviews && reviews.length > 0) {
          totalReviews = reviews.length;
          const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
          averageRating = Math.round((sumRatings / totalReviews) * 10) / 10;

          // Calculate breakdown
          reviews.forEach(review => {
            const idx = ratingBreakdown.findIndex(r => r.stars === review.rating);
            if (idx >= 0) ratingBreakdown[idx].count++;
          });
        }
      }

      // Get top products by order count
      const productSales: Record<string, { id: string; title: string; sales: number; image: string | null }> = {};
      
      sellerOrders.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          if (item.seller_id === sellerId) {
            if (!productSales[item.product_id]) {
              productSales[item.product_id] = {
                id: item.product_id,
                title: item.title || 'Unknown Product',
                sales: 0,
                image: item.image_url || null,
              };
            }
            productSales[item.product_id].sales += Number(item.price_pkr || 0) * (item.quantity || 1);
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return {
        totalSales,
        salesByMonth,
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        fulfillmentRate,
        averageRating,
        totalReviews,
        ratingBreakdown,
        topProducts,
      };
    },
    enabled: !!sellerId,
  });

  return { performance: performance || getEmptyPerformance(), isLoading };
};

function getEmptyPerformance(): SellerPerformanceData {
  return {
    totalSales: 0,
    salesByMonth: [],
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    fulfillmentRate: 0,
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
    topProducts: [],
  };
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardSeller {
  id: string;
  user_id: string;
  shop_name: string;
  full_name: string;
  avatar_url: string | null;
  display_id: string | null;
  total_sales: number;
  total_orders: number;
  average_rating: number;
  review_count: number;
  fulfillment_rate: number;
  products_count: number;
  rank: number;
}

export type LeaderboardMetric = "sales" | "ratings" | "fulfillment";

interface SellerProfileData {
  id: string;
  user_id: string;
  shop_name: string;
  display_id?: string | null;
}

export const useSellerLeaderboard = (metric: LeaderboardMetric = "sales", limit: number = 10) => {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["seller-leaderboard", metric, limit],
    queryFn: async () => {
      // Get verified sellers only
      const { data: sellerProfiles, error: sellersError } = await supabase
        .from("seller_profiles")
        .select("id, user_id, shop_name")
        .eq("verification_status", "verified");

      if (sellersError) throw sellersError;
      if (!sellerProfiles || sellerProfiles.length === 0) return [];

      const typedProfiles = sellerProfiles as SellerProfileData[];
      const userIds = typedProfiles.map(s => s.user_id);

      // Parallel fetch all required data
      const [profilesRes, productsRes, ordersRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds),
        supabase.from("products").select("id, seller_id, status").in("seller_id", userIds),
        supabase.from("orders").select("id, items, order_status, total_amount_pkr"),
        supabase.from("product_reviews").select("product_id, rating"),
      ]);

      // Build maps
      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      
      // Calculate metrics per seller
      const sellerMetrics: Record<string, {
        totalSales: number;
        totalOrders: number;
        completedOrders: number;
        ratings: number[];
        productsCount: number;
      }> = {};

      // Initialize all sellers
      typedProfiles.forEach(sp => {
        sellerMetrics[sp.user_id] = {
          totalSales: 0,
          totalOrders: 0,
          completedOrders: 0,
          ratings: [],
          productsCount: 0,
        };
      });

      // Count products per seller
      productsRes.data?.forEach(product => {
        if (sellerMetrics[product.seller_id]) {
          sellerMetrics[product.seller_id].productsCount++;
        }
      });

      // Calculate sales and orders from order items
      ordersRes.data?.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          const sellerId = item.seller_id;
          if (sellerId && sellerMetrics[sellerId]) {
            const itemTotal = (item.price_pkr || 0) * (item.quantity || 1);
            sellerMetrics[sellerId].totalSales += itemTotal;
            sellerMetrics[sellerId].totalOrders++;
            
            if (order.order_status === "delivered") {
              sellerMetrics[sellerId].completedOrders++;
            }
          }
        });
      });

      // Get product IDs per seller for reviews
      const productIdToSeller: Record<string, string> = {};
      productsRes.data?.forEach(p => {
        productIdToSeller[p.id] = p.seller_id;
      });

      // Aggregate ratings per seller
      reviewsRes.data?.forEach(review => {
        const sellerId = productIdToSeller[review.product_id];
        if (sellerId && sellerMetrics[sellerId]) {
          sellerMetrics[sellerId].ratings.push(review.rating);
        }
      });

      // Build leaderboard entries
      const leaderboardData: LeaderboardSeller[] = typedProfiles.map(sp => {
        const profile = profileMap.get(sp.user_id);
        const metrics = sellerMetrics[sp.user_id];
        
        const avgRating = metrics.ratings.length > 0
          ? metrics.ratings.reduce((a, b) => a + b, 0) / metrics.ratings.length
          : 0;
        
        const fulfillmentRate = metrics.totalOrders > 0
          ? (metrics.completedOrders / metrics.totalOrders) * 100
          : 0;

        return {
          id: sp.id,
          user_id: sp.user_id,
          shop_name: sp.shop_name,
          full_name: profile?.full_name || "Unknown",
          avatar_url: profile?.avatar_url || null,
          display_id: sp.display_id || null,
          total_sales: metrics.totalSales,
          total_orders: metrics.totalOrders,
          average_rating: Math.round(avgRating * 10) / 10,
          review_count: metrics.ratings.length,
          fulfillment_rate: Math.round(fulfillmentRate),
          products_count: metrics.productsCount,
          rank: 0,
        };
      });

      // Sort by selected metric
      leaderboardData.sort((a, b) => {
        switch (metric) {
          case "sales":
            return b.total_sales - a.total_sales;
          case "ratings":
            return b.average_rating - a.average_rating || b.review_count - a.review_count;
          case "fulfillment":
            return b.fulfillment_rate - a.fulfillment_rate || b.total_orders - a.total_orders;
          default:
            return b.total_sales - a.total_sales;
        }
      });

      // Assign ranks
      leaderboardData.forEach((seller, index) => {
        seller.rank = index + 1;
      });

      return leaderboardData.slice(0, limit);
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return { leaderboard, isLoading };
};

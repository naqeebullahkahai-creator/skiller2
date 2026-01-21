import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductWithRating {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  category: string;
  brand: string | null;
  price_pkr: number;
  discount_price_pkr: number | null;
  images: string[] | null;
  stock_count: number;
  status: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  average_rating: number;
  review_count: number;
}

// Hook to get active products with their average ratings
export const useActiveProductsWithRatings = () => {
  return useQuery({
    queryKey: ["products-with-ratings"],
    queryFn: async () => {
      // Get active products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active");

      if (productsError) throw productsError;

      if (!products?.length) return [];

      // Get review stats for all products
      const { data: reviews, error: reviewsError } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .eq("is_hidden", false);

      if (reviewsError) throw reviewsError;

      // Calculate ratings per product
      const ratingMap = new Map<string, { total: number; count: number }>();
      (reviews || []).forEach((r) => {
        const existing = ratingMap.get(r.product_id) || { total: 0, count: 0 };
        ratingMap.set(r.product_id, {
          total: existing.total + r.rating,
          count: existing.count + 1,
        });
      });

      // Merge products with ratings
      return products.map((p) => {
        const stats = ratingMap.get(p.id);
        return {
          ...p,
          average_rating: stats ? stats.total / stats.count : 0,
          review_count: stats?.count || 0,
        };
      }) as ProductWithRating[];
    },
  });
};

// Sort products by rating (for search ranking)
export const sortProductsByRating = (
  products: ProductWithRating[],
  sortBy: string
): ProductWithRating[] => {
  switch (sortBy) {
    case "rating":
      return [...products].sort((a, b) => {
        // First by rating, then by review count
        if (b.average_rating !== a.average_rating) {
          return b.average_rating - a.average_rating;
        }
        return b.review_count - a.review_count;
      });
    case "bestseller":
      // Combine rating and review count for a "popularity" score
      return [...products].sort((a, b) => {
        const scoreA = a.average_rating * Math.log10(a.review_count + 1);
        const scoreB = b.average_rating * Math.log10(b.review_count + 1);
        return scoreB - scoreA;
      });
    default:
      return products;
  }
};

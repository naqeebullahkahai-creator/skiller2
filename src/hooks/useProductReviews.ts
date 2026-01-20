import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_name?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [key: number]: number };
}

// Hook to fetch reviews for a product
export const useProductReviews = (productId: string | undefined) => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((review: any) => ({
        ...review,
        user_name: review.profiles?.full_name || "Customer",
      })) as ProductReview[];
    },
    enabled: !!productId,
  });

  // Calculate stats
  const stats: ReviewStats = {
    averageRating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
    totalReviews: reviews.length,
    ratingCounts: {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    },
  };

  return { reviews, stats, isLoading };
};

// Hook to check if user can review a product (has delivered order)
export const useCanReview = (productId: string | undefined) => {
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  });

  const { data: canReview = false, isLoading } = useQuery({
    queryKey: ["can-review", productId, userId],
    queryFn: async () => {
      if (!productId || !userId) return false;

      // Check if user has a delivered order containing this product
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, items")
        .eq("customer_id", userId)
        .eq("order_status", "delivered");

      if (ordersError || !orders) return false;

      // Check if any delivered order contains this product
      const hasDeliveredProduct = orders.some((order) => {
        const items = order.items as any[];
        return items.some((item: any) => item.product_id === productId);
      });

      if (!hasDeliveredProduct) return false;

      // Check if user already reviewed
      const { data: existingReview } = await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle();

      return !existingReview; // Can review only if no existing review
    },
    enabled: !!productId && !!userId,
  });

  // Get the order ID for the delivered product
  const { data: deliveredOrderId } = useQuery({
    queryKey: ["delivered-order-id", productId, userId],
    queryFn: async () => {
      if (!productId || !userId) return null;

      const { data: orders } = await supabase
        .from("orders")
        .select("id, items")
        .eq("customer_id", userId)
        .eq("order_status", "delivered");

      if (!orders) return null;

      for (const order of orders) {
        const items = order.items as any[];
        if (items.some((item: any) => item.product_id === productId)) {
          return order.id;
        }
      }
      return null;
    },
    enabled: !!productId && !!userId && canReview,
  });

  return { canReview, isLoading, deliveredOrderId, userId };
};

// Hook to submit a review
export const useSubmitReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      productId,
      orderId,
      userId,
      rating,
      reviewText,
    }: {
      productId: string;
      orderId: string;
      userId: string;
      rating: number;
      reviewText: string;
    }) => {
      const { error } = await supabase.from("product_reviews").insert([
        {
          product_id: productId,
          order_id: orderId,
          user_id: userId,
          rating,
          review_text: reviewText || null,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["can-review", variables.productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

import { useState, useEffect } from "react";
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
  images: string[];
  seller_reply: string | null;
  seller_replied_at: string | null;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
  user_name?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: { [key: number]: number };
}

// Hook to fetch reviews for a product (excluding hidden ones for customers)
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
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((review: any) => ({
        ...review,
        images: review.images || [],
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

  // Collect all customer images
  const customerImages = reviews.flatMap((r) => r.images || []);

  return { reviews, stats, isLoading, customerImages };
};

// Hook to check if user can review a product (has delivered order)
export const useCanReview = (productId: string | undefined) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

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

// Hook to submit a review with images
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
      images,
    }: {
      productId: string;
      orderId: string;
      userId: string;
      rating: number;
      reviewText: string;
      images?: string[];
    }) => {
      const { error } = await supabase.from("product_reviews").insert([
        {
          product_id: productId,
          order_id: orderId,
          user_id: userId,
          rating,
          review_text: reviewText || null,
          images: images || [],
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

// Hook for sellers to reply to reviews
export const useSellerReplyToReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          seller_reply: reply,
          seller_replied_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Reply Posted", description: "Your reply has been saved." });
      queryClient.invalidateQueries({ queryKey: ["seller-product-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });
};

// Hook for sellers to get reviews on their products
export const useSellerProductReviews = (sellerId: string | undefined) => {
  return useQuery({
    queryKey: ["seller-product-reviews", sellerId],
    queryFn: async () => {
      if (!sellerId) return [];

      // Get seller's products first
      const { data: products } = await supabase
        .from("products")
        .select("id, title, images")
        .eq("seller_id", sellerId);

      if (!products?.length) return [];

      const productIds = products.map((p) => p.id);
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Get reviews for those products
      const { data: reviews, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (reviews || []).map((r: any) => ({
        ...r,
        images: r.images || [],
        user_name: r.profiles?.full_name || "Customer",
        product: productMap.get(r.product_id),
      }));
    },
    enabled: !!sellerId,
  });
};

// Hook for admin to get all reviews for moderation
export const useAdminReviews = () => {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select(`
          *,
          profiles:user_id (full_name, email),
          products:product_id (title, images, seller_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((r: any) => ({
        ...r,
        images: r.images || [],
        user_name: r.profiles?.full_name || "Customer",
        user_email: r.profiles?.email,
        product_title: r.products?.title,
        product_image: r.products?.images?.[0],
        seller_id: r.products?.seller_id,
      }));
    },
  });
};

// Hook for admin to hide/unhide reviews
export const useAdminModerateReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      isHidden,
      reason,
      adminId,
    }: {
      reviewId: string;
      isHidden: boolean;
      reason?: string;
      adminId: string;
    }) => {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          is_hidden: isHidden,
          hidden_by: isHidden ? adminId : null,
          hidden_at: isHidden ? new Date().toISOString() : null,
          hidden_reason: isHidden ? reason || null : null,
        })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.isHidden ? "Review Hidden" : "Review Restored",
        description: variables.isHidden
          ? "The review is now hidden from customers."
          : "The review is now visible to customers.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to moderate review",
        variant: "destructive",
      });
    },
  });
};

// Hook to get average rating for a product (for search ranking)
export const useProductRating = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-rating", productId],
    queryFn: async () => {
      if (!productId) return { average: 0, count: 0 };

      const { data, error } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", productId)
        .eq("is_hidden", false);

      if (error) throw error;

      const ratings = data || [];
      const average = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return { average, count: ratings.length };
    },
    enabled: !!productId,
  });
};

// Utility to upload review images
export const uploadReviewImage = async (userId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("review-images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading review image:", error);
    return null;
  }

  const { data } = supabase.storage.from("review-images").getPublicUrl(fileName);
  return data.publicUrl;
};

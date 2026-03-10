import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSellerFollow = (sellerId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get follower count
  const { data: followerCount = 0 } = useQuery({
    queryKey: ["seller-followers-count", sellerId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("seller_followers")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId!);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!sellerId,
  });

  // Check if current user is following
  const { data: isFollowing = false } = useQuery({
    queryKey: ["seller-is-following", sellerId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_followers")
        .select("id")
        .eq("seller_id", sellerId!)
        .eq("follower_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!sellerId && !!user,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("seller_followers")
        .insert({ seller_id: sellerId!, follower_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-followers-count", sellerId] });
      queryClient.invalidateQueries({ queryKey: ["seller-is-following", sellerId, user?.id] });
      toast.success("Store followed!");
    },
    onError: () => toast.error("Could not follow store"),
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("seller_followers")
        .delete()
        .eq("seller_id", sellerId!)
        .eq("follower_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-followers-count", sellerId] });
      queryClient.invalidateQueries({ queryKey: ["seller-is-following", sellerId, user?.id] });
      toast.success("Store unfollowed");
    },
    onError: () => toast.error("Could not unfollow store"),
  });

  // Realtime subscription for follower count
  useEffect(() => {
    if (!sellerId) return;
    const channel = supabase
      .channel(`seller-followers-${sellerId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "seller_followers",
        filter: `seller_id=eq.${sellerId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["seller-followers-count", sellerId] });
        queryClient.invalidateQueries({ queryKey: ["seller-is-following", sellerId, user?.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sellerId, user?.id, queryClient]);

  const toggleFollow = () => {
    if (!user) {
      toast.error("Please login to follow stores");
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    followerCount,
    isFollowing,
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};

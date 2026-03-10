import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";
import { useEffect, useMemo } from "react";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface SellerWithDetails {
  id: string;
  user_id: string;
  shop_name: string;
  full_name: string;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  city: string | null;
  created_at: string;
  products_count: number;
  wallet_balance: number;
  total_earnings: number;
  total_orders: number;
  display_id: string | null;
}

export const useAdminSellers = (searchQuery?: string) => {
  const queryClient = useQueryClient();

  const { data: allSellers = [], isLoading, error } = useQuery({
    queryKey: ["admin-sellers"],
    queryFn: async () => {
      const { data: sellerProfiles, error: sellersError } = await supabase
        .from("seller_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (sellersError) throw sellersError;
      if (!sellerProfiles || sellerProfiles.length === 0) return [];

      const userIds = sellerProfiles.map((s) => s.user_id);

      const [profilesRes, productsRes, walletsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url, email").in("id", userIds).neq("email", SUPER_ADMIN_EMAIL),
        supabase.from("products").select("seller_id").in("seller_id", userIds),
        supabase.from("seller_wallets").select("seller_id, current_balance, total_earnings").in("seller_id", userIds),
        supabase.from("orders").select("items"),
      ]);

      const profiles = profilesRes.data;
      const products = productsRes.data;
      const wallets = walletsRes.data;
      const orders = ordersRes.data;

      const orderCountBySeller: Record<string, number> = {};
      orders?.forEach((order) => {
        const items = order.items as any[];
        items?.forEach((item) => {
          const sellerId = item.seller_id;
          if (sellerId && userIds.includes(sellerId)) {
            orderCountBySeller[sellerId] = (orderCountBySeller[sellerId] || 0) + 1;
          }
        });
      });

      return sellerProfiles
        .map((seller) => {
          const profile = profiles?.find((p) => p.id === seller.user_id);
          if (!profile) return null;

          const productCount = products?.filter((p) => p.seller_id === seller.user_id).length || 0;
          const wallet = wallets?.find((w) => w.seller_id === seller.user_id);

          return {
            id: seller.id,
            user_id: seller.user_id,
            shop_name: seller.shop_name,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            verification_status: seller.verification_status,
            city: seller.city,
            created_at: seller.created_at,
            products_count: productCount,
            wallet_balance: Number(wallet?.current_balance || 0),
            total_earnings: Number(wallet?.total_earnings || 0),
            total_orders: orderCountBySeller[seller.user_id] || 0,
            display_id: seller.display_id || null,
          };
        })
        .filter((seller): seller is NonNullable<typeof seller> => seller !== null) as SellerWithDetails[];
    },
  });

  const sellers = useMemo(() => {
    if (!searchQuery) return allSellers;

    const searchLower = searchQuery.toLowerCase();
    return allSellers.filter(
      (seller) =>
        seller.shop_name?.toLowerCase().includes(searchLower) ||
        seller.full_name?.toLowerCase().includes(searchLower) ||
        seller.city?.toLowerCase().includes(searchLower) ||
        seller.display_id?.toLowerCase().includes(searchLower)
    );
  }, [allSellers, searchQuery]);

  // Realtime: refresh on seller related changes
  useEffect(() => {
    const channel = supabase
      .channel("admin-sellers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "seller_profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "seller_wallets" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const stats = {
    totalSellers: sellers.length,
    verifiedSellers: sellers.filter((s) => s.verification_status === "verified").length,
    pendingSellers: sellers.filter((s) => s.verification_status === "pending").length,
    totalEarnings: sellers.reduce((sum, s) => sum + s.total_earnings, 0),
  };

  return { sellers, isLoading, error, stats };
};

export const useSellerDetails = (sellerId: string) => {
  const queryClient = useQueryClient();

  const { data: seller, isLoading } = useQuery({
    queryKey: ["admin-seller-details", sellerId],
    queryFn: async () => {
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("seller_profiles").select("*").eq("id", sellerId).single();
      if (sellerError) throw sellerError;

      const [profileRes, walletRes, productsRes, transactionsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", sellerProfile.user_id).neq("email", SUPER_ADMIN_EMAIL).maybeSingle(),
        supabase.from("seller_wallets").select("*").eq("seller_id", sellerProfile.user_id).maybeSingle(),
        supabase.from("products").select("*").eq("seller_id", sellerProfile.user_id).order("created_at", { ascending: false }).limit(10),
        supabase.from("wallet_transactions").select("*").eq("seller_id", sellerProfile.user_id).order("created_at", { ascending: false }).limit(20),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);

      if (!profileRes.data) throw new Error("Seller not found or access denied");

      const sellerOrders = ordersRes.data?.filter(order => {
        const items = order.items as any[];
        return items?.some(item => item.seller_id === sellerProfile.user_id);
      }).slice(0, 20) || [];

      return {
        ...sellerProfile,
        profile: profileRes.data,
        wallet: walletRes.data,
        products: productsRes.data || [],
        transactions: transactionsRes.data || [],
        orders: sellerOrders,
      };
    },
    enabled: !!sellerId,
  });

  // Realtime for seller detail
  useEffect(() => {
    if (!sellerId) return;
    const channel = supabase
      .channel(`seller-detail-${sellerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-seller-details', sellerId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_wallets' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-seller-details', sellerId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sellerId, queryClient]);

  return { seller, isLoading };
};

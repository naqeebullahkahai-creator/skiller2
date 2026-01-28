import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";

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
  const { data: sellers = [], isLoading, error } = useQuery({
    queryKey: ["admin-sellers", searchQuery],
    queryFn: async () => {
      // Get all seller profiles with user details
      let query = supabase
        .from("seller_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: sellerProfiles, error: sellersError } = await query;
      if (sellersError) throw sellersError;

      if (!sellerProfiles || sellerProfiles.length === 0) {
        return [];
      }

      // Get user IDs
      const userIds = sellerProfiles.map(s => s.user_id);

      // Get profiles for these users - exclude super admin
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds)
        .neq("email", SUPER_ADMIN_EMAIL); // Exclude super admin from sellers list

      // Get products count per seller
      const { data: products } = await supabase
        .from("products")
        .select("seller_id")
        .in("seller_id", userIds);

      // Get seller wallets
      const { data: wallets } = await supabase
        .from("seller_wallets")
        .select("seller_id, current_balance, total_earnings")
        .in("seller_id", userIds);

      // Get orders count per seller
      const { data: orders } = await supabase
        .from("orders")
        .select("items");

      // Count orders per seller from order items
      const orderCountBySeller: Record<string, number> = {};
      orders?.forEach(order => {
        const items = order.items as any[];
        items?.forEach(item => {
          const sellerId = item.seller_id;
          if (sellerId && userIds.includes(sellerId)) {
            orderCountBySeller[sellerId] = (orderCountBySeller[sellerId] || 0) + 1;
          }
        });
      });

      // Combine data - filter out sellers that don't have matching profiles (e.g., super admin)
      const sellersWithDetails: SellerWithDetails[] = sellerProfiles
        .map((seller) => {
          const profile = profiles?.find((p) => p.id === seller.user_id);
          
          // Skip if no matching profile (likely super admin or filtered out)
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

      // Apply search filter - include display_id (FZN-SEL-XXXXXX)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return sellersWithDetails.filter(
          (seller) =>
            seller.shop_name?.toLowerCase().includes(searchLower) ||
            seller.full_name?.toLowerCase().includes(searchLower) ||
            seller.city?.toLowerCase().includes(searchLower) ||
            seller.display_id?.toLowerCase().includes(searchLower)
        );
      }

      return sellersWithDetails;
    },
  });

  // Calculate stats
  const stats = {
    totalSellers: sellers.length,
    verifiedSellers: sellers.filter((s) => s.verification_status === "verified").length,
    pendingSellers: sellers.filter((s) => s.verification_status === "pending").length,
    totalEarnings: sellers.reduce((sum, s) => sum + s.total_earnings, 0),
  };

  return { sellers, isLoading, error, stats };
};

export const useSellerDetails = (sellerId: string) => {
  const { data: seller, isLoading } = useQuery({
    queryKey: ["admin-seller-details", sellerId],
    queryFn: async () => {
      // Get seller profile
      const { data: sellerProfile, error: sellerError } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", sellerId)
        .single();

      if (sellerError) throw sellerError;

      // Get user profile - check it's not the super admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sellerProfile.user_id)
        .neq("email", SUPER_ADMIN_EMAIL)
        .maybeSingle();

      if (!profile) {
        throw new Error("Seller not found or access denied");
      }

      // Get wallet
      const { data: wallet } = await supabase
        .from("seller_wallets")
        .select("*")
        .eq("seller_id", sellerProfile.user_id)
        .maybeSingle();

      // Get products
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerProfile.user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Get wallet transactions
      const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("seller_id", sellerProfile.user_id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get orders for this seller
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter orders containing this seller's products
      const sellerOrders = allOrders?.filter(order => {
        const items = order.items as any[];
        return items?.some(item => item.seller_id === sellerProfile.user_id);
      }).slice(0, 20) || [];

      return {
        ...sellerProfile,
        profile,
        wallet,
        products: products || [],
        transactions: transactions || [],
        orders: sellerOrders,
      };
    },
    enabled: !!sellerId,
  });

  return { seller, isLoading };
};

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserWithDetails {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  role: string;
  orders_count: number;
  total_spent: number;
  wallet_balance: number;
  seller_profile?: {
    shop_name: string;
    verification_status: string;
    city: string;
  } | null;
}

export const useAdminUsers = (searchQuery?: string) => {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users", searchQuery],
    queryFn: async () => {
      // Get all profiles
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // Get roles for all users
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Get orders count and totals
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_id, total_amount_pkr");

      // Get customer wallets
      const { data: wallets } = await supabase
        .from("customer_wallets")
        .select("customer_id, balance");

      // Get seller profiles
      const { data: sellerProfiles } = await supabase
        .from("seller_profiles")
        .select("user_id, shop_name, verification_status, city");

      // Combine data
      const usersWithDetails: UserWithDetails[] = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        const userOrders = orders?.filter((o) => o.customer_id === profile.id) || [];
        const userWallet = wallets?.find((w) => w.customer_id === profile.id);
        const sellerProfile = sellerProfiles?.find((s) => s.user_id === profile.id);

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          role: userRole?.role || "customer",
          orders_count: userOrders.length,
          total_spent: userOrders.reduce((sum, o) => sum + Number(o.total_amount_pkr || 0), 0),
          wallet_balance: Number(userWallet?.balance || 0),
          seller_profile: sellerProfile ? {
            shop_name: sellerProfile.shop_name,
            verification_status: sellerProfile.verification_status,
            city: sellerProfile.city,
          } : null,
        };
      }) || [];

      return usersWithDetails;
    },
  });

  return { users, isLoading, error };
};

export const useUserDetails = (userId: string) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user-details", userId],
    queryFn: async () => {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Get role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      // Get orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get wallet
      const { data: wallet } = await supabase
        .from("customer_wallets")
        .select("*")
        .eq("customer_id", userId)
        .single();

      // Get seller profile if applicable
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Get seller wallet if applicable
      let sellerWallet = null;
      if (roleData?.role === "seller") {
        const { data: sw } = await supabase
          .from("seller_wallets")
          .select("*")
          .eq("seller_id", userId)
          .single();
        sellerWallet = sw;
      }

      return {
        ...profile,
        role: roleData?.role || "customer",
        orders: orders || [],
        wallet,
        seller_profile: sellerProfile,
        seller_wallet: sellerWallet,
      };
    },
    enabled: !!userId,
  });

  return { user, isLoading };
};

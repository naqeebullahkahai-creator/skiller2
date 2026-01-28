import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";

export interface CustomerWithDetails {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
  wallet_balance: number;
  display_id: string | null;
}

export const useAdminCustomers = (searchQuery?: string) => {
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["admin-customers", searchQuery],
    queryFn: async () => {
      // Get all profiles
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("email", SUPER_ADMIN_EMAIL) // Never expose super admin
        .order("created_at", { ascending: false });

      if (searchQuery) {
        // Search by name, email, or display_id (FZN-USR-XXXXXX)
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,display_id.ilike.%${searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;

      // Get roles for all users - we only want customers (not sellers or admins)
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      // Filter to only customers (role = 'customer' or no role assigned)
      const customerIds = profiles?.filter(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return !userRole || userRole.role === 'customer';
      }).map(p => p.id) || [];

      // Get orders count and totals for customers only
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_id, total_amount_pkr");

      // Get customer wallets
      const { data: wallets } = await supabase
        .from("customer_wallets")
        .select("customer_id, balance");

      // Combine data for customers only
      const customersWithDetails: CustomerWithDetails[] = profiles
        ?.filter(profile => customerIds.includes(profile.id))
        .map((profile) => {
          const userOrders = orders?.filter((o) => o.customer_id === profile.id) || [];
          const userWallet = wallets?.find((w) => w.customer_id === profile.id);

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            phone_number: profile.phone_number,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at,
            orders_count: userOrders.length,
            total_spent: userOrders.reduce((sum, o) => sum + Number(o.total_amount_pkr || 0), 0),
            wallet_balance: Number(userWallet?.balance || 0),
            display_id: profile.display_id || null,
          };
        }) || [];

      return customersWithDetails;
    },
  });

  // Calculate stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats = {
    totalCustomers: customers.length,
    totalOrders: customers.reduce((sum, c) => sum + c.orders_count, 0),
    totalSpent: customers.reduce((sum, c) => sum + c.total_spent, 0),
    newThisMonth: customers.filter(c => new Date(c.created_at) >= monthStart).length,
  };

  return { customers, isLoading, error, stats };
};

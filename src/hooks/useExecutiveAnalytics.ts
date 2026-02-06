import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay } from "date-fns";

export interface ExecutiveStats {
  totalPlatformBalance: number;
  adminDirectEarnings: number;
  commissionRevenue: number;
  pendingActions: number;
  pendingDeposits: number;
  pendingKyc: number;
  pendingProducts: number;
}

export interface FinancialFlowPoint {
  date: string;
  revenue: number;
  withdrawals: number;
}

export const useExecutiveAnalytics = () => {
  const statsQuery = useQuery({
    queryKey: ["executive-stats"],
    queryFn: async (): Promise<ExecutiveStats> => {
      // Total Platform Balance = sum of all seller wallets + customer wallets
      const [sellerWallets, customerWallets, pendingDeposits, pendingKyc, pendingProducts] =
        await Promise.all([
          supabase.from("seller_wallets").select("current_balance"),
          supabase.from("customer_wallets").select("balance"),
          supabase.from("deposit_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("seller_profiles").select("*", { count: "exact", head: true }).eq("verification_status", "pending"),
          supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);

      const sellerBalance = sellerWallets.data?.reduce((s, w) => s + Number(w.current_balance), 0) || 0;
      const customerBalance = customerWallets.data?.reduce((s, w) => s + Number(w.balance), 0) || 0;

      // Admin direct earnings - get admin user IDs then sum delivered order revenue for admin products
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = new Set((adminRoles || []).map((r) => r.user_id));

      const { data: deliveredOrders } = await supabase
        .from("orders")
        .select("items, total_amount_pkr")
        .eq("order_status", "delivered");

      let adminDirectEarnings = 0;
      let vendorSalesTotal = 0;
      for (const order of deliveredOrders || []) {
        const items = Array.isArray(order.items) ? order.items : [];
        for (const item of items as any[]) {
          const amount = (item.price_pkr || 0) * (item.quantity || 1);
          if (adminIds.has(item.seller_id)) {
            adminDirectEarnings += amount;
          } else {
            vendorSalesTotal += amount;
          }
        }
      }

      // Commission revenue from subscription deduction logs + flash sale fees
      const { data: subLogs } = await supabase
        .from("subscription_deduction_logs" as any)
        .select("amount, status")
        .eq("status", "success");
      const subscriptionFees = (subLogs || []).reduce((s: number, l: any) => s + Number(l.amount), 0);

      const { data: flashFees } = await supabase
        .from("flash_sale_nominations")
        .select("total_fee_pkr")
        .eq("fee_deducted", true);
      const flashSaleFees = (flashFees || []).reduce((s, f) => s + Number(f.total_fee_pkr), 0);

      const pDeposits = pendingDeposits.count || 0;
      const pKyc = pendingKyc.count || 0;
      const pProducts = pendingProducts.count || 0;

      return {
        totalPlatformBalance: sellerBalance + customerBalance,
        adminDirectEarnings,
        commissionRevenue: subscriptionFees + flashSaleFees,
        pendingActions: pDeposits + pKyc + pProducts,
        pendingDeposits: pDeposits,
        pendingKyc: pKyc,
        pendingProducts: pProducts,
      };
    },
    staleTime: 60000,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
  });

  // Financial flow chart - last 30 days
  const flowQuery = useQuery({
    queryKey: ["executive-financial-flow"],
    queryFn: async (): Promise<FinancialFlowPoint[]> => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      const [ordersRes, payoutsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total_amount_pkr, created_at")
          .eq("order_status", "delivered")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("payout_requests")
          .select("amount, processed_at")
          .eq("status", "completed")
          .gte("processed_at", thirtyDaysAgo.toISOString()),
      ]);

      // Group by day
      const dayMap = new Map<string, { revenue: number; withdrawals: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = format(startOfDay(subDays(now, i)), "dd MMM");
        dayMap.set(d, { revenue: 0, withdrawals: 0 });
      }

      for (const o of ordersRes.data || []) {
        const d = format(new Date(o.created_at), "dd MMM");
        if (dayMap.has(d)) dayMap.get(d)!.revenue += Number(o.total_amount_pkr);
      }

      for (const p of payoutsRes.data || []) {
        if (!p.processed_at) continue;
        const d = format(new Date(p.processed_at), "dd MMM");
        if (dayMap.has(d)) dayMap.get(d)!.withdrawals += Number(p.amount);
      }

      return Array.from(dayMap.entries()).map(([date, vals]) => ({
        date,
        revenue: vals.revenue,
        withdrawals: vals.withdrawals,
      }));
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  return {
    stats: statsQuery.data,
    financialFlow: flowQuery.data || [],
    isLoading: statsQuery.isLoading || flowQuery.isLoading,
    refetch: () => {
      statsQuery.refetch();
      flowQuery.refetch();
    },
  };
};

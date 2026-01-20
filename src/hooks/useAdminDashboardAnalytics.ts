import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  pendingApprovals: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  approvalsChange: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface SalesDataPoint {
  month: string;
  revenue: number;
}

export const useAdminDashboardAnalytics = () => {
  // Fetch dashboard stats
  const statsQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));

      // Get total revenue (delivered orders)
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_amount_pkr, created_at")
        .eq("order_status", "delivered");

      const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount_pkr), 0) || 0;
      
      const thisMonthRevenue = revenueData?.filter(o => new Date(o.created_at) >= thisMonthStart)
        .reduce((sum, o) => sum + Number(o.total_amount_pkr), 0) || 0;
      
      const lastMonthRevenue = revenueData?.filter(o => 
        new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) < thisMonthStart
      ).reduce((sum, o) => sum + Number(o.total_amount_pkr), 0) || 0;

      const revenueChange = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Get total orders count
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: thisMonthOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonthStart.toISOString());

      const { count: lastMonthOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", thisMonthStart.toISOString());

      const ordersChange = (lastMonthOrders || 0) > 0 
        ? (((thisMonthOrders || 0) - (lastMonthOrders || 0)) / (lastMonthOrders || 1)) * 100 
        : 0;

      // Get active products count
      const { count: activeProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: lastMonthProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lt("created_at", thisMonthStart.toISOString());

      const productsChange = (lastMonthProducts || 0) > 0 
        ? (((activeProducts || 0) - (lastMonthProducts || 0)) / (lastMonthProducts || 1)) * 100 
        : 0;

      // Get pending approvals (products + seller profiles)
      const { count: pendingProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingSellers } = await supabase
        .from("seller_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending");

      const pendingApprovals = (pendingProducts || 0) + (pendingSellers || 0);

      return {
        totalRevenue,
        totalOrders: totalOrders || 0,
        activeProducts: activeProducts || 0,
        pendingApprovals,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        productsChange: Math.round(productsChange * 10) / 10,
        approvalsChange: 0, // Not applicable for approvals
      };
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch recent orders
  const recentOrdersQuery = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async (): Promise<RecentOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total_amount_pkr, order_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
        customerName: order.customer_name,
        totalAmount: Number(order.total_amount_pkr),
        status: order.order_status,
        createdAt: order.created_at,
      }));
    },
    staleTime: 30000,
  });

  // Fetch sales data for chart (last 6 months)
  const salesDataQuery = useQuery({
    queryKey: ["admin-sales-chart"],
    queryFn: async (): Promise<SalesDataPoint[]> => {
      const months: SalesDataPoint[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const nextMonthStart = startOfMonth(subMonths(now, i - 1));

        const { data } = await supabase
          .from("orders")
          .select("total_amount_pkr")
          .eq("order_status", "delivered")
          .gte("created_at", monthStart.toISOString())
          .lt("created_at", i === 0 ? new Date().toISOString() : nextMonthStart.toISOString());

        const revenue = data?.reduce((sum, o) => sum + Number(o.total_amount_pkr), 0) || 0;

        months.push({
          month: format(monthDate, "MMM"),
          revenue,
        });
      }

      return months;
    },
    staleTime: 60000, // 1 minute
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Set up realtime subscription for orders
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin-recent-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-sales-chart"] });
          toast({
            title: "Dashboard Updated",
            description: "New order activity detected",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  return {
    stats: statsQuery.data,
    recentOrders: recentOrdersQuery.data || [],
    salesData: salesDataQuery.data || [],
    isLoading: statsQuery.isLoading || recentOrdersQuery.isLoading || salesDataQuery.isLoading,
    isError: statsQuery.isError || recentOrdersQuery.isError || salesDataQuery.isError,
    refetch: () => {
      statsQuery.refetch();
      recentOrdersQuery.refetch();
      salesDataQuery.refetch();
    },
  };
};

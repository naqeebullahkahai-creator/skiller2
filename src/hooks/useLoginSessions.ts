import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LoginSession {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  device_name: string | null;
  browser_name: string | null;
  os_name: string | null;
  login_at: string;
  logout_at: string | null;
  session_duration_minutes: number | null;
  login_status: string;
  is_suspicious: boolean;
  suspicious_reason: string | null;
  is_new_device: boolean;
  created_at: string;
}

export interface LoginFilters {
  role?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  suspiciousOnly?: boolean;
}

export const useLoginSessions = (filters: LoginFilters = {}) => {
  return useQuery({
    queryKey: ["login-sessions", filters],
    queryFn: async () => {
      let query = supabase
        .from("login_sessions")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(200);

      if (filters.role && filters.role !== "all") {
        query = query.eq("user_role", filters.role);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("login_status", filters.status);
      }
      if (filters.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte("login_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("login_at", filters.dateTo + "T23:59:59");
      }
      if (filters.suspiciousOnly) {
        query = query.eq("is_suspicious", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LoginSession[];
    },
  });
};

export const useUserLoginHistory = (userId: string | null) => {
  return useQuery({
    queryKey: ["user-login-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("login_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("login_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as LoginSession[];
    },
    enabled: !!userId,
  });
};

export const useBlockIP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ip, reason }: { ip: string; reason: string }) => {
      const { error } = await supabase
        .from("blocked_ips")
        .insert({ ip_address: ip, reason });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP blocked successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to block IP"),
  });
};

export const useBlockedIPs = () => {
  return useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUnblockIP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP unblocked");
    },
  });
};

export const useLoginStats = () => {
  return useQuery({
    queryKey: ["login-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      const [totalRes, todayRes, suspiciousRes, failedRes] = await Promise.all([
        supabase.from("login_sessions").select("id", { count: "exact", head: true }),
        supabase.from("login_sessions").select("id", { count: "exact", head: true }).gte("login_at", today),
        supabase.from("login_sessions").select("id", { count: "exact", head: true }).eq("is_suspicious", true),
        supabase.from("login_sessions").select("id", { count: "exact", head: true }).eq("login_status", "failed"),
      ]);
      
      return {
        total: totalRes.count || 0,
        today: todayRes.count || 0,
        suspicious: suspiciousRes.count || 0,
        failed: failedRes.count || 0,
      };
    },
  });
};

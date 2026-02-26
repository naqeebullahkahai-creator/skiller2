import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SellerSubscription {
  id: string;
  seller_id: string;
  subscription_type: string;
  plan_type: 'daily' | 'half_monthly' | 'monthly';
  custom_daily_fee: number | null;
  custom_monthly_fee: number | null;
  last_deduction_at: string | null;
  next_deduction_at: string | null;
  is_active: boolean;
  payment_pending: boolean;
  pending_amount: number;
  total_fees_paid: number;
  free_months: number;
  free_period_start: string | null;
  free_period_end: string | null;
  is_in_free_period: boolean;
  account_suspended: boolean;
  suspended_at: string | null;
  reactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDeductionLog {
  id: string;
  seller_id: string;
  subscription_id: string;
  amount: number;
  deduction_type: string;
  status: 'success' | 'failed' | 'pending';
  failure_reason: string | null;
  wallet_balance_before: number;
  wallet_balance_after: number;
  created_at: string;
}

export const PLAN_LABELS: Record<string, string> = {
  daily: 'Daily',
  half_monthly: '15-Day',
  monthly: 'Monthly',
};

export const useSellerSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['seller-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('seller_subscriptions' as any)
        .select('*')
        .eq('seller_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as SellerSubscription | null;
    },
    enabled: !!user?.id,
  });

  const { data: deductionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['subscription-deduction-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('subscription_deduction_logs' as any)
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as SubscriptionDeductionLog[];
    },
    enabled: !!user?.id,
  });

  const { data: globalFees } = useQuery({
    queryKey: ['subscription-global-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['per_day_platform_fee', 'new_seller_free_months']);
      if (error) throw error;
      const fees = { perDay: 25, freeMonths: 1 };
      data?.forEach(s => {
        if (s.setting_key === 'per_day_platform_fee') fees.perDay = parseFloat(s.setting_value);
        if (s.setting_key === 'new_seller_free_months') fees.freeMonths = parseInt(s.setting_value);
      });
      return fees;
    },
  });

  // Plan change request
  const { data: planChangeRequests } = useQuery({
    queryKey: ['plan-change-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('seller_plan_change_requests' as any)
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  const requestPlanChange = useMutation({
    mutationFn: async (newPlan: string) => {
      if (!user?.id || !subscription) throw new Error('No subscription');
      const { error } = await supabase
        .from('seller_plan_change_requests' as any)
        .insert({
          seller_id: user.id,
          current_plan: subscription.plan_type,
          requested_plan: newPlan,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Plan change request submitted');
      queryClient.invalidateQueries({ queryKey: ['plan-change-requests'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Calculate effective fee
  const perDayFee = subscription?.custom_daily_fee ?? globalFees?.perDay ?? 25;
  const effectiveFee = subscription?.plan_type === 'monthly'
    ? perDayFee * 30
    : subscription?.plan_type === 'half_monthly'
    ? perDayFee * 15
    : perDayFee;

  // Free period countdown
  const freePeriodDaysLeft = subscription?.is_in_free_period && subscription?.free_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.free_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    subscription,
    deductionLogs,
    globalFees,
    effectiveFee,
    perDayFee,
    freePeriodDaysLeft,
    planChangeRequests,
    requestPlanChange,
    isLoading: subscriptionLoading || logsLoading,
    hasPaymentPending: subscription?.payment_pending ?? false,
    pendingAmount: subscription?.pending_amount ?? 0,
    isSuspended: subscription?.account_suspended ?? false,
  };
};

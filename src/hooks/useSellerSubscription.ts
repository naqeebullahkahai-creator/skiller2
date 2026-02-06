import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SellerSubscription {
  id: string;
  seller_id: string;
  subscription_type: 'daily' | 'monthly';
  custom_daily_fee: number | null;
  custom_monthly_fee: number | null;
  last_deduction_at: string | null;
  next_deduction_at: string | null;
  is_active: boolean;
  payment_pending: boolean;
  pending_amount: number;
  total_fees_paid: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDeductionLog {
  id: string;
  seller_id: string;
  subscription_id: string;
  amount: number;
  deduction_type: 'daily' | 'monthly' | 'manual';
  status: 'success' | 'failed' | 'pending';
  failure_reason: string | null;
  wallet_balance_before: number;
  wallet_balance_after: number;
  created_at: string;
}

export const useSellerSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['seller-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Use raw SQL query since types aren't generated yet
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

  // Get global fees for comparison
  const { data: globalFees } = useQuery({
    queryKey: ['subscription-global-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['daily_platform_fee', 'monthly_platform_fee']);

      if (error) throw error;
      
      const fees = {
        daily: 20,
        monthly: 500,
      };
      
      data?.forEach(setting => {
        if (setting.setting_key === 'daily_platform_fee') {
          fees.daily = parseFloat(setting.setting_value);
        } else if (setting.setting_key === 'monthly_platform_fee') {
          fees.monthly = parseFloat(setting.setting_value);
        }
      });
      
      return fees;
    },
  });

  // Calculate effective fee
  const effectiveFee = subscription?.subscription_type === 'monthly'
    ? (subscription?.custom_monthly_fee ?? globalFees?.monthly ?? 500)
    : (subscription?.custom_daily_fee ?? globalFees?.daily ?? 20);

  return {
    subscription,
    deductionLogs,
    globalFees,
    effectiveFee,
    isLoading: subscriptionLoading || logsLoading,
    hasPaymentPending: subscription?.payment_pending ?? false,
    pendingAmount: subscription?.pending_amount ?? 0,
  };
};

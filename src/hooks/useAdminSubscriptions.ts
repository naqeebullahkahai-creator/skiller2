import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SellerSubscription, SubscriptionDeductionLog } from './useSellerSubscription';

interface DeductionResult {
  success: boolean;
  message?: string;
  amount?: number;
  next_deduction?: string;
  pending_amount?: number;
}

export const useAdminSubscriptions = () => {
  const queryClient = useQueryClient();

  // Get global subscription fees
  const { data: globalFees, isLoading: feesLoading } = useQuery({
    queryKey: ['admin-subscription-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['daily_platform_fee', 'monthly_platform_fee']);

      if (error) throw error;
      
      const fees = {
        daily: 25,
        monthly: 600,
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

  // Update global fees
  const updateGlobalFees = useMutation({
    mutationFn: async ({ dailyFee, monthlyFee }: { dailyFee: number; monthlyFee: number }) => {
      const updates = [
        supabase
          .from('admin_settings')
          .update({ setting_value: dailyFee.toString() })
          .eq('setting_key', 'daily_platform_fee'),
        supabase
          .from('admin_settings')
          .update({ setting_value: monthlyFee.toString() })
          .eq('setting_key', 'monthly_platform_fee'),
      ];

      const results = await Promise.all(updates);
      results.forEach(({ error }) => {
        if (error) throw error;
      });
    },
    onSuccess: () => {
      toast.success('Platform fees updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-fees'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fees: ${error.message}`);
    },
  });

  // Get all seller subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['admin-seller-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_subscriptions' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as SellerSubscription[];
    },
  });

  // Get all deduction logs
  const { data: deductionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-subscription-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_deduction_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as unknown as SubscriptionDeductionLog[];
    },
  });

  // Update seller subscription (per-seller override)
  const updateSellerSubscription = useMutation({
    mutationFn: async ({ 
      sellerId, 
      customDailyFee, 
      customMonthlyFee,
      subscriptionType,
      isActive 
    }: { 
      sellerId: string; 
      customDailyFee?: number | null;
      customMonthlyFee?: number | null;
      subscriptionType?: 'daily' | 'monthly';
      isActive?: boolean;
    }) => {
      // Check if subscription exists
      const { data: existing } = await supabase
        .from('seller_subscriptions' as any)
        .select('id')
        .eq('seller_id', sellerId)
        .maybeSingle();

      const updateData: Record<string, unknown> = {};
      if (customDailyFee !== undefined) updateData.custom_daily_fee = customDailyFee;
      if (customMonthlyFee !== undefined) updateData.custom_monthly_fee = customMonthlyFee;
      if (subscriptionType !== undefined) updateData.subscription_type = subscriptionType;
      if (isActive !== undefined) updateData.is_active = isActive;
      updateData.updated_at = new Date().toISOString();

      if (existing) {
        const { data, error } = await supabase
          .from('seller_subscriptions' as any)
          .update(updateData)
          .eq('seller_id', sellerId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('seller_subscriptions' as any)
          .insert({
            seller_id: sellerId,
            ...updateData,
            next_deduction_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success('Seller subscription updated');
      queryClient.invalidateQueries({ queryKey: ['admin-seller-subscriptions'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update subscription: ${error.message}`);
    },
  });

  // Manual deduction trigger
  const triggerManualDeduction = useMutation({
    mutationFn: async (sellerId: string) => {
      const { data, error } = await supabase.rpc('process_subscription_deduction', {
        p_seller_id: sellerId,
      });

      if (error) throw error;
      return data as unknown as DeductionResult;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(`Fee of Rs. ${data.amount} deducted successfully`);
      } else {
        toast.error(data?.message || 'Failed to process deduction');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-seller-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-seller-wallets'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to process deduction: ${error.message}`);
    },
  });

  const pendingPaymentsCount = subscriptions?.filter(s => s.payment_pending).length ?? 0;
  const totalPendingAmount = subscriptions
    ?.filter(s => s.payment_pending)
    .reduce((sum, s) => sum + Number(s.pending_amount), 0) ?? 0;

  return {
    globalFees,
    feesLoading,
    updateGlobalFees,
    subscriptions,
    subscriptionsLoading,
    deductionLogs,
    logsLoading,
    updateSellerSubscription,
    triggerManualDeduction,
    pendingPaymentsCount,
    totalPendingAmount,
  };
};

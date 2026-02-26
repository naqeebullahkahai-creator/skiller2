import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SellerSubscription, SubscriptionDeductionLog } from './useSellerSubscription';

export const useAdminSubscriptions = () => {
  const queryClient = useQueryClient();

  const { data: globalFees, isLoading: feesLoading } = useQuery({
    queryKey: ['admin-subscription-fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
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

  const updateGlobalFees = useMutation({
    mutationFn: async ({ perDayFee, freeMonths }: { perDayFee: number; freeMonths: number }) => {
      const updates = [
        supabase.from('admin_settings').update({ setting_value: perDayFee.toString() }).eq('setting_key', 'per_day_platform_fee'),
        supabase.from('admin_settings').update({ setting_value: freeMonths.toString() }).eq('setting_key', 'new_seller_free_months'),
      ];
      const results = await Promise.all(updates);
      results.forEach(({ error }) => { if (error) throw error; });
    },
    onSuccess: () => {
      toast.success('Fee settings updated');
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-fees'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

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

  const { data: planChangeRequests, isLoading: planChangeLoading } = useQuery({
    queryKey: ['admin-plan-change-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_plan_change_requests' as any)
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const updateSellerSubscription = useMutation({
    mutationFn: async ({ sellerId, customDailyFee, planType, isActive }: {
      sellerId: string;
      customDailyFee?: number | null;
      planType?: string;
      isActive?: boolean;
    }) => {
      const { data: existing } = await supabase
        .from('seller_subscriptions' as any)
        .select('id')
        .eq('seller_id', sellerId)
        .maybeSingle();

      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (customDailyFee !== undefined) updateData.custom_daily_fee = customDailyFee;
      if (planType !== undefined) { updateData.plan_type = planType; updateData.subscription_type = planType; }
      if (isActive !== undefined) updateData.is_active = isActive;

      if (existing) {
        const { error } = await supabase.from('seller_subscriptions' as any).update(updateData).eq('seller_id', sellerId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('seller_subscriptions' as any).insert({
          seller_id: sellerId, ...updateData,
          next_deduction_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Subscription updated');
      queryClient.invalidateQueries({ queryKey: ['admin-seller-subscriptions'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const triggerManualDeduction = useMutation({
    mutationFn: async (sellerId: string) => {
      const { data, error } = await supabase.rpc('process_subscription_deduction', { p_seller_id: sellerId });
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data) => {
      if (data?.success) toast.success(`Rs. ${data.amount} deducted`);
      else toast.error(data?.message || 'Deduction failed');
      queryClient.invalidateQueries({ queryKey: ['admin-seller-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-logs'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approvePlanChange = useMutation({
    mutationFn: async ({ requestId, sellerId, newPlan }: { requestId: string; sellerId: string; newPlan: string }) => {
      // Update plan
      await supabase.from('seller_subscriptions' as any).update({
        plan_type: newPlan, subscription_type: newPlan, updated_at: new Date().toISOString(),
      }).eq('seller_id', sellerId);
      // Update request
      await supabase.from('seller_plan_change_requests' as any).update({
        status: 'approved', processed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq('id', requestId);
    },
    onSuccess: () => {
      toast.success('Plan change approved');
      queryClient.invalidateQueries({ queryKey: ['admin-plan-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-seller-subscriptions'] });
    },
  });

  const rejectPlanChange = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      await supabase.from('seller_plan_change_requests' as any).update({
        status: 'rejected', admin_notes: notes, processed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq('id', requestId);
    },
    onSuccess: () => {
      toast.success('Plan change rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-plan-change-requests'] });
    },
  });

  const pendingPaymentsCount = subscriptions?.filter(s => s.payment_pending).length ?? 0;
  const suspendedCount = subscriptions?.filter(s => s.account_suspended).length ?? 0;
  const totalPendingAmount = subscriptions?.filter(s => s.payment_pending).reduce((sum, s) => sum + Number(s.pending_amount), 0) ?? 0;

  return {
    globalFees, feesLoading, updateGlobalFees,
    subscriptions, subscriptionsLoading,
    deductionLogs, logsLoading,
    planChangeRequests, planChangeLoading,
    updateSellerSubscription, triggerManualDeduction,
    approvePlanChange, rejectPlanChange,
    pendingPaymentsCount, suspendedCount, totalPendingAmount,
  };
};

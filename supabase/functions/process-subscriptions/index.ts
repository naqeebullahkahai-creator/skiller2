import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting subscription processing...");

    const now = new Date().toISOString();

    // Get all active, non-free-period subscriptions due for deduction
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .from('seller_subscriptions')
      .select('id, seller_id, plan_type, next_deduction_at, is_in_free_period, free_period_end')
      .eq('is_active', true)
      .lte('next_deduction_at', now);

    if (fetchError) throw fetchError;

    console.log(`Found ${dueSubscriptions?.length || 0} subscriptions due`);

    const results = { processed: 0, successful: 0, failed: 0, skipped_free: 0, details: [] as any[] };

    for (const sub of (dueSubscriptions || [])) {
      try {
        // Skip if in free period
        if (sub.is_in_free_period && sub.free_period_end && new Date(sub.free_period_end) > new Date()) {
          results.skipped_free++;
          continue;
        }

        const { data: result, error: rpcError } = await supabase.rpc(
          'process_subscription_deduction',
          { p_seller_id: sub.seller_id }
        );

        if (rpcError) {
          results.failed++;
          results.details.push({ seller_id: sub.seller_id, success: false, message: rpcError.message });
        } else {
          const r = result as any;
          if (r?.success) results.successful++;
          else results.failed++;
          results.details.push({ seller_id: sub.seller_id, success: r?.success ?? false, message: r?.message ?? 'Unknown' });
        }
        results.processed++;
      } catch (error) {
        results.failed++;
        results.details.push({ seller_id: sub.seller_id, success: false, message: String(error) });
        results.processed++;
      }
    }

    // Send billing reminders (2 days before next deduction)
    const reminderDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const { data: upcomingSubs } = await supabase
      .from('seller_subscriptions')
      .select('seller_id, plan_type, next_deduction_at')
      .eq('is_active', true)
      .eq('is_in_free_period', false)
      .eq('account_suspended', false)
      .lte('next_deduction_at', reminderDate)
      .gt('next_deduction_at', now);

    for (const sub of (upcomingSubs || [])) {
      await supabase.from('notifications').insert({
        user_id: sub.seller_id,
        title: '⏰ Billing Reminder',
        message: `Your ${sub.plan_type} platform fee is due on ${new Date(sub.next_deduction_at).toLocaleDateString()}. Ensure sufficient wallet balance.`,
        notification_type: 'system',
        link: '/seller/wallet',
      });
    }

    // Check for free periods ending soon (3 days before)
    const freeEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: endingFree } = await supabase
      .from('seller_subscriptions')
      .select('seller_id, free_period_end')
      .eq('is_in_free_period', true)
      .lte('free_period_end', freeEndDate)
      .gt('free_period_end', now);

    for (const sub of (endingFree || [])) {
      await supabase.from('notifications').insert({
        user_id: sub.seller_id,
        title: '⚠️ Free Period Ending Soon',
        message: `Your free period ends on ${new Date(sub.free_period_end).toLocaleDateString()}. Billing will start automatically.`,
        notification_type: 'system',
        link: '/seller/wallet',
      });
    }

    console.log("Processing complete:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SellerSubscription {
  id: string;
  seller_id: string;
  subscription_type: 'daily' | 'monthly';
  next_deduction_at: string | null;
  is_active: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting subscription deduction processing...");

    // Get all active subscriptions that are due for deduction
    const now = new Date().toISOString();
    
    const { data: dueSubscriptions, error: fetchError } = await supabase
      .from('seller_subscriptions')
      .select('id, seller_id, subscription_type, next_deduction_at')
      .eq('is_active', true)
      .lte('next_deduction_at', now);

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueSubscriptions?.length || 0} subscriptions due for deduction`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      details: [] as { seller_id: string; success: boolean; message: string }[],
    };

    // Process each subscription
    for (const subscription of (dueSubscriptions as SellerSubscription[] || [])) {
      try {
        console.log(`Processing deduction for seller ${subscription.seller_id}`);
        
        const { data: result, error: rpcError } = await supabase.rpc(
          'process_subscription_deduction',
          { p_seller_id: subscription.seller_id }
        );

        if (rpcError) {
          console.error(`Error processing seller ${subscription.seller_id}:`, rpcError);
          results.failed++;
          results.details.push({
            seller_id: subscription.seller_id,
            success: false,
            message: rpcError.message,
          });
        } else {
          const deductionResult = result as { success: boolean; message: string };
          if (deductionResult?.success) {
            results.successful++;
          } else {
            results.failed++;
          }
          results.details.push({
            seller_id: subscription.seller_id,
            success: deductionResult?.success ?? false,
            message: deductionResult?.message ?? 'Unknown result',
          });
        }
        results.processed++;
      } catch (error) {
        console.error(`Exception processing seller ${subscription.seller_id}:`, error);
        results.failed++;
        results.details.push({
          seller_id: subscription.seller_id,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        results.processed++;
      }
    }

    console.log(`Deduction processing complete. Results:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} subscriptions`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in process-subscriptions:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

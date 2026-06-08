-- Enable realtime + full replica identity for admin/seller/agent management tables.
-- Existing publication members are skipped via the DO block to keep this idempotent.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'orders',
    'order_items',
    'products',
    'product_variants',
    'product_commissions',
    'seller_profiles',
    'seller_wallets',
    'seller_subscriptions',
    'wallet_transactions',
    'payout_requests',
    'deposit_requests',
    'profiles',
    'user_roles',
    'customer_wallets',
    'customer_wallet_transactions',
    'return_requests',
    'cancellation_logs',
    'agent_wallets',
    'agent_payouts',
    'agent_online_status',
    'agent_performance',
    'support_messages',
    'support_agent_status',
    'admin_wallet',
    'admin_store_wallet',
    'commission_wallet',
    'activity_logs',
    'financial_logs',
    'login_sessions',
    'order_settlements'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Set REPLICA IDENTITY FULL so UPDATE events include previous row data
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);

    -- Add to realtime publication (ignore if already present)
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN others THEN
        -- Some objects may already be in publication via 'FOR ALL TABLES' or similar
        RAISE NOTICE 'Skipping % (%) : %', t, SQLSTATE, SQLERRM;
    END;
  END LOOP;
END $$;
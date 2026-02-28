
-- ============================================
-- 1. FIX BALANCE ADJUSTMENT: Add missing enum values
-- ============================================
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'admin_credit';
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'admin_debit';
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'flash_sale_fee';

-- ============================================
-- 2. FIX adjust_seller_wallet_balance function (wrong column name)
-- ============================================
CREATE OR REPLACE FUNCTION public.adjust_seller_wallet_balance(p_seller_id uuid, p_amount numeric, p_adjustment_type text, p_reason text, p_admin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_final_amount NUMERIC;
  v_txn_type wallet_transaction_type;
BEGIN
  SELECT id, current_balance INTO v_wallet_id, v_current_balance
  FROM seller_wallets WHERE seller_id = p_seller_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO seller_wallets (seller_id, current_balance, pending_clearance, total_earnings, total_withdrawn)
    VALUES (p_seller_id, 0, 0, 0, 0)
    RETURNING id, current_balance INTO v_wallet_id, v_current_balance;
  END IF;
  
  IF p_adjustment_type = 'subtract' THEN
    v_final_amount := -ABS(p_amount);
    IF v_current_balance + v_final_amount < 0 THEN
      RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance for deduction');
    END IF;
    v_txn_type := 'admin_debit';
  ELSE
    v_final_amount := ABS(p_amount);
    v_txn_type := 'admin_credit';
  END IF;
  
  v_new_balance := v_current_balance + v_final_amount;
  
  UPDATE seller_wallets SET current_balance = v_new_balance, updated_at = NOW() WHERE id = v_wallet_id;
  
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, gross_amount, net_amount, transaction_type, description
  ) VALUES (
    v_wallet_id, p_seller_id, ABS(v_final_amount), v_final_amount, v_txn_type,
    'Admin adjustment: ' || p_reason
  );
  
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    p_seller_id,
    CASE WHEN v_final_amount >= 0 THEN 'Wallet Credited' ELSE 'Wallet Debited' END,
    'Your wallet has been ' || 
    CASE WHEN v_final_amount >= 0 THEN 'credited with ' ELSE 'debited by ' END ||
    'PKR ' || ABS(v_final_amount)::TEXT || '. Reason: ' || p_reason,
    'wallet', '/seller/wallet'
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Balance adjusted successfully', 'new_balance', v_new_balance, 'adjustment', v_final_amount);
END;
$function$;

-- ============================================
-- 3. MAINTENANCE MODE TIMER: Add timer fields
-- ============================================
INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES 
  ('maintenance_end_time', '', 'Scheduled end time for maintenance mode (ISO 8601)'),
  ('maintenance_allowed_roles', 'admin', 'Comma-separated roles allowed during maintenance'),
  ('maintenance_message', 'We are currently updating the store for a better experience.', 'Custom maintenance message')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 4. PER-ORDER FEE SYSTEM: Add settings
-- ============================================
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES 
  ('per_order_fee_enabled', 'false', 'Enable per-order flat fee for sellers'),
  ('per_order_fee_amount', '50', 'Per-order flat fee amount in PKR')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 5. PAYMENT METHODS: Add master toggle
-- ============================================
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('cod_only_mode', 'false', 'When true, only Cash on Delivery is available as payment method')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 6. SUPPORT AGENT: Ensure role exists in enum
-- ============================================
-- support_agent is already in app_role enum per existing code
-- Add agent dashboard settings
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('max_concurrent_chats', '5', 'Maximum concurrent chats per support agent')
ON CONFLICT (setting_key) DO NOTHING;

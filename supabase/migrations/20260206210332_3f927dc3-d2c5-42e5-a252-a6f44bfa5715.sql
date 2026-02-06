-- Function to adjust customer wallet balance (admin only)
CREATE OR REPLACE FUNCTION adjust_customer_wallet_balance(
  p_customer_id UUID,
  p_amount NUMERIC,
  p_adjustment_type TEXT, -- 'add' or 'subtract'
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  -- Get or create wallet
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM customer_wallets
  WHERE customer_id = p_customer_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO customer_wallets (customer_id, balance, total_refunds, total_spent)
    VALUES (p_customer_id, 0, 0, 0)
    RETURNING id, balance INTO v_wallet_id, v_current_balance;
  END IF;
  
  -- Calculate adjustment
  IF p_adjustment_type = 'subtract' THEN
    v_final_amount := -ABS(p_amount);
    IF v_current_balance + v_final_amount < 0 THEN
      RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance for deduction');
    END IF;
  ELSE
    v_final_amount := ABS(p_amount);
  END IF;
  
  v_new_balance := v_current_balance + v_final_amount;
  
  -- Update wallet balance
  UPDATE customer_wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO customer_wallet_transactions (
    wallet_id, customer_id, amount, transaction_type, description
  ) VALUES (
    v_wallet_id, p_customer_id, v_final_amount,
    CASE WHEN v_final_amount >= 0 THEN 'admin_credit' ELSE 'admin_debit' END,
    'Admin adjustment: ' || p_reason
  );
  
  -- Create notification for customer
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    p_customer_id,
    CASE WHEN v_final_amount >= 0 THEN 'Wallet Credited' ELSE 'Wallet Debited' END,
    'Your wallet has been ' || 
    CASE WHEN v_final_amount >= 0 THEN 'credited with ' ELSE 'debited by ' END ||
    'PKR ' || ABS(v_final_amount)::TEXT || '. Reason: ' || p_reason,
    'wallet',
    '/account/profile'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Balance adjusted successfully',
    'new_balance', v_new_balance,
    'adjustment', v_final_amount
  );
END;
$$;

-- Function to adjust seller wallet balance (admin only)
CREATE OR REPLACE FUNCTION adjust_seller_wallet_balance(
  p_seller_id UUID,
  p_amount NUMERIC,
  p_adjustment_type TEXT, -- 'add' or 'subtract'
  p_reason TEXT,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  -- Get or create wallet
  SELECT id, current_balance INTO v_wallet_id, v_current_balance
  FROM seller_wallets
  WHERE seller_id = p_seller_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO seller_wallets (seller_id, current_balance, pending_clearance, total_earnings, total_withdrawn)
    VALUES (p_seller_id, 0, 0, 0, 0)
    RETURNING id, current_balance INTO v_wallet_id, v_current_balance;
  END IF;
  
  -- Calculate adjustment
  IF p_adjustment_type = 'subtract' THEN
    v_final_amount := -ABS(p_amount);
    IF v_current_balance + v_final_amount < 0 THEN
      RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance for deduction');
    END IF;
  ELSE
    v_final_amount := ABS(p_amount);
  END IF;
  
  v_new_balance := v_current_balance + v_final_amount;
  
  -- Update wallet balance
  UPDATE seller_wallets
  SET current_balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, amount, transaction_type, description
  ) VALUES (
    v_wallet_id, p_seller_id, v_final_amount,
    CASE WHEN v_final_amount >= 0 THEN 'admin_credit' ELSE 'admin_debit' END,
    'Admin adjustment: ' || p_reason
  );
  
  -- Create notification for seller
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    p_seller_id,
    CASE WHEN v_final_amount >= 0 THEN 'Wallet Credited' ELSE 'Wallet Debited' END,
    'Your wallet has been ' || 
    CASE WHEN v_final_amount >= 0 THEN 'credited with ' ELSE 'debited by ' END ||
    'PKR ' || ABS(v_final_amount)::TEXT || '. Reason: ' || p_reason,
    'wallet',
    '/seller/wallet'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Balance adjusted successfully',
    'new_balance', v_new_balance,
    'adjustment', v_final_amount
  );
END;
$$;
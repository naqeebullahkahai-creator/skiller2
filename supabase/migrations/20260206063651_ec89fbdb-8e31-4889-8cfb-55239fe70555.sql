
-- First, add platform_fee to the wallet_transaction_type enum
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'platform_fee';

-- Trigger to create subscription when seller is verified
CREATE OR REPLACE FUNCTION public.create_seller_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.verification_status = 'verified' AND (OLD.verification_status IS DISTINCT FROM 'verified') THEN
    INSERT INTO seller_subscriptions (seller_id, next_deduction_at)
    VALUES (NEW.user_id, now() + INTERVAL '1 day')
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_seller_verified_create_subscription
AFTER UPDATE ON seller_profiles
FOR EACH ROW
EXECUTE FUNCTION create_seller_subscription();

-- Update the process_subscription_deduction function to use proper type
CREATE OR REPLACE FUNCTION public.process_subscription_deduction(p_seller_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_subscription RECORD;
  v_wallet RECORD;
  v_fee_amount NUMERIC;
  v_next_deduction TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription FROM seller_subscriptions 
  WHERE seller_id = p_seller_id AND is_active = true;
  
  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No active subscription found');
  END IF;
  
  -- Get wallet
  SELECT * INTO v_wallet FROM seller_wallets WHERE seller_id = p_seller_id;
  
  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Seller wallet not found');
  END IF;
  
  -- Calculate fee
  v_fee_amount := get_seller_subscription_fee(p_seller_id, v_subscription.subscription_type);
  
  -- Calculate next deduction date
  IF v_subscription.subscription_type = 'daily' THEN
    v_next_deduction := now() + INTERVAL '1 day';
  ELSE
    v_next_deduction := now() + INTERVAL '30 days';
  END IF;
  
  -- Check if wallet has sufficient balance
  IF v_wallet.current_balance < v_fee_amount THEN
    -- Mark as payment pending
    UPDATE seller_subscriptions
    SET payment_pending = true,
        pending_amount = pending_amount + v_fee_amount,
        next_deduction_at = v_next_deduction,
        updated_at = now()
    WHERE id = v_subscription.id;
    
    -- Log failed deduction
    INSERT INTO subscription_deduction_logs (
      seller_id, subscription_id, amount, deduction_type, status,
      failure_reason, wallet_balance_before, wallet_balance_after
    ) VALUES (
      p_seller_id, v_subscription.id, v_fee_amount, v_subscription.subscription_type, 'failed',
      'Insufficient wallet balance', v_wallet.current_balance, v_wallet.current_balance
    );
    
    -- Create notification for seller
    INSERT INTO notifications (user_id, title, message, notification_type, link)
    VALUES (
      p_seller_id,
      '⚠️ Payment Pending',
      'Your platform fee of Rs. ' || v_fee_amount || ' could not be deducted due to insufficient balance. Please top up your wallet.',
      'system',
      '/seller-center/wallet'
    );
    
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Insufficient balance',
      'pending_amount', v_fee_amount
    );
  END IF;
  
  -- Deduct from wallet
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, transaction_type,
    gross_amount, net_amount, description
  ) VALUES (
    v_wallet.id, p_seller_id, 'platform_fee'::wallet_transaction_type,
    v_fee_amount, -v_fee_amount,
    v_subscription.subscription_type || ' platform fee deduction'
  );
  
  UPDATE seller_wallets
  SET current_balance = current_balance - v_fee_amount,
      updated_at = now()
  WHERE id = v_wallet.id;
  
  -- Update subscription
  UPDATE seller_subscriptions
  SET last_deduction_at = now(),
      next_deduction_at = v_next_deduction,
      total_fees_paid = total_fees_paid + v_fee_amount,
      payment_pending = false,
      updated_at = now()
  WHERE id = v_subscription.id;
  
  -- Log successful deduction
  INSERT INTO subscription_deduction_logs (
    seller_id, subscription_id, amount, deduction_type, status,
    wallet_balance_before, wallet_balance_after
  ) VALUES (
    p_seller_id, v_subscription.id, v_fee_amount, v_subscription.subscription_type, 'success',
    v_wallet.current_balance, v_wallet.current_balance - v_fee_amount
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Fee deducted successfully',
    'amount', v_fee_amount,
    'next_deduction', v_next_deduction
  );
END;
$$;

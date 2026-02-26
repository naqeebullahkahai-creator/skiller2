
-- ============================================================
-- SELLER SUBSCRIPTION & FEE MANAGEMENT SYSTEM - Full Creation
-- ============================================================

-- Enable pgcrypto for PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Drop old functions that reference non-existent tables
DROP FUNCTION IF EXISTS public.get_seller_subscription_fee(uuid, text);
DROP FUNCTION IF EXISTS public.process_subscription_deduction(uuid);
DROP FUNCTION IF EXISTS public.create_seller_subscription() CASCADE;

-- 2. Create seller_subscriptions table
CREATE TABLE public.seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL UNIQUE,
  subscription_type text NOT NULL DEFAULT 'daily',
  plan_type text NOT NULL DEFAULT 'daily', -- daily, half_monthly, monthly
  custom_daily_fee numeric(12,2),
  custom_monthly_fee numeric(12,2),
  last_deduction_at timestamptz,
  next_deduction_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  payment_pending boolean NOT NULL DEFAULT false,
  pending_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_fees_paid numeric(12,2) NOT NULL DEFAULT 0,
  free_months integer NOT NULL DEFAULT 0,
  free_period_start timestamptz,
  free_period_end timestamptz,
  is_in_free_period boolean NOT NULL DEFAULT false,
  account_suspended boolean NOT NULL DEFAULT false,
  suspended_at timestamptz,
  reactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own subscription"
  ON public.seller_subscriptions FOR SELECT
  USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscriptions"
  ON public.seller_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert subscriptions"
  ON public.seller_subscriptions FOR INSERT
  WITH CHECK (true);

-- 3. Create subscription_deduction_logs table
CREATE TABLE public.subscription_deduction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.seller_subscriptions(id),
  amount numeric(12,2) NOT NULL,
  deduction_type text NOT NULL, -- daily, half_monthly, monthly, manual
  status text NOT NULL DEFAULT 'pending', -- success, failed, pending
  failure_reason text,
  wallet_balance_before numeric(12,2) NOT NULL DEFAULT 0,
  wallet_balance_after numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_deduction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own logs"
  ON public.subscription_deduction_logs FOR SELECT
  USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
  ON public.subscription_deduction_logs FOR INSERT
  WITH CHECK (true);

-- 4. Create admin_wallet table
CREATE TABLE public.admin_wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance numeric(12,2) NOT NULL DEFAULT 0,
  total_subscription_earnings numeric(12,2) NOT NULL DEFAULT 0,
  total_commission_earnings numeric(12,2) NOT NULL DEFAULT 0,
  pin_hash text,
  pin_set boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admin can access admin wallet"
  ON public.admin_wallet FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 5. Create admin_wallet_transactions table
CREATE TABLE public.admin_wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL,
  amount numeric(12,2) NOT NULL,
  seller_id uuid,
  subscription_id uuid,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admin can view admin wallet transactions"
  ON public.admin_wallet_transactions FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 6. Create seller_plan_change_requests table
CREATE TABLE public.seller_plan_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  current_plan text NOT NULL,
  requested_plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  processed_by uuid,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_plan_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own plan change requests"
  ON public.seller_plan_change_requests FOR SELECT
  USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sellers can create plan change requests"
  ON public.seller_plan_change_requests FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Admins can update plan change requests"
  ON public.seller_plan_change_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can select plan change requests"
  ON public.seller_plan_change_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add fee settings
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
  ('per_day_platform_fee', '25', 'Per day platform fee in PKR')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES 
  ('new_seller_free_months', '1', 'Number of free months for new sellers')
ON CONFLICT (setting_key) DO NOTHING;

-- 8. Functions

CREATE OR REPLACE FUNCTION public.get_seller_per_day_fee(p_seller_id uuid)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_custom_fee numeric; v_global_fee numeric;
BEGIN
  SELECT custom_daily_fee INTO v_custom_fee FROM seller_subscriptions WHERE seller_id = p_seller_id;
  IF v_custom_fee IS NOT NULL THEN RETURN v_custom_fee; END IF;
  SELECT CAST(setting_value AS numeric) INTO v_global_fee FROM admin_settings WHERE setting_key = 'per_day_platform_fee';
  RETURN COALESCE(v_global_fee, 25);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_plan_fee(p_seller_id uuid, p_plan_type text)
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_per_day numeric;
BEGIN
  v_per_day := get_seller_per_day_fee(p_seller_id);
  RETURN CASE p_plan_type
    WHEN 'daily' THEN v_per_day
    WHEN 'half_monthly' THEN v_per_day * 15
    WHEN 'monthly' THEN v_per_day * 30
    ELSE v_per_day
  END;
END;
$$;

-- 9. Main deduction function
CREATE OR REPLACE FUNCTION public.process_subscription_deduction(p_seller_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_sub RECORD; v_wallet RECORD; v_fee numeric; v_next timestamptz; v_awid uuid;
BEGIN
  SELECT * INTO v_sub FROM seller_subscriptions WHERE seller_id = p_seller_id AND is_active = true;
  IF v_sub IS NULL THEN RETURN jsonb_build_object('success', false, 'message', 'No active subscription'); END IF;
  
  IF v_sub.is_in_free_period AND v_sub.free_period_end > now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'In free period', 'free_until', v_sub.free_period_end);
  END IF;
  
  IF v_sub.is_in_free_period AND v_sub.free_period_end <= now() THEN
    UPDATE seller_subscriptions SET is_in_free_period = false, updated_at = now() WHERE id = v_sub.id;
  END IF;
  
  SELECT * INTO v_wallet FROM seller_wallets WHERE seller_id = p_seller_id;
  IF v_wallet IS NULL THEN RETURN jsonb_build_object('success', false, 'message', 'Wallet not found'); END IF;
  
  v_fee := calculate_plan_fee(p_seller_id, v_sub.plan_type);
  v_next := CASE v_sub.plan_type WHEN 'daily' THEN now()+INTERVAL '1 day' WHEN 'half_monthly' THEN now()+INTERVAL '15 days' WHEN 'monthly' THEN now()+INTERVAL '30 days' ELSE now()+INTERVAL '1 day' END;
  
  IF v_wallet.current_balance < v_fee THEN
    UPDATE seller_subscriptions SET payment_pending=true, pending_amount=pending_amount+v_fee, account_suspended=true, suspended_at=now(), next_deduction_at=v_next, updated_at=now() WHERE id=v_sub.id;
    UPDATE products SET is_active=false WHERE seller_id=p_seller_id AND is_active=true;
    INSERT INTO subscription_deduction_logs (seller_id,subscription_id,amount,deduction_type,status,failure_reason,wallet_balance_before,wallet_balance_after) VALUES (p_seller_id,v_sub.id,v_fee,v_sub.plan_type,'failed','Insufficient balance - Suspended',v_wallet.current_balance,v_wallet.current_balance);
    INSERT INTO notifications (user_id,title,message,notification_type,link) VALUES (p_seller_id,'🚫 Account Suspended','Fee of Rs. '||v_fee||' failed. Products hidden. Add funds to reactivate.','system','/seller-center/wallet');
    RETURN jsonb_build_object('success',false,'message','Suspended','pending_amount',v_fee,'suspended',true);
  END IF;
  
  INSERT INTO wallet_transactions (wallet_id,seller_id,transaction_type,gross_amount,net_amount,description) VALUES (v_wallet.id,p_seller_id,'platform_fee',v_fee,-v_fee,v_sub.plan_type||' fee Rs.'||v_fee);
  UPDATE seller_wallets SET current_balance=current_balance-v_fee, updated_at=now() WHERE id=v_wallet.id;
  
  SELECT id INTO v_awid FROM admin_wallet LIMIT 1;
  IF v_awid IS NULL THEN INSERT INTO admin_wallet (total_balance,total_subscription_earnings) VALUES (v_fee,v_fee) RETURNING id INTO v_awid;
  ELSE UPDATE admin_wallet SET total_balance=total_balance+v_fee, total_subscription_earnings=total_subscription_earnings+v_fee, updated_at=now() WHERE id=v_awid; END IF;
  INSERT INTO admin_wallet_transactions (transaction_type,amount,seller_id,subscription_id,description) VALUES ('subscription_fee',v_fee,p_seller_id,v_sub.id,v_sub.plan_type||' fee');
  
  UPDATE seller_subscriptions SET last_deduction_at=now(), next_deduction_at=v_next, total_fees_paid=total_fees_paid+v_fee, payment_pending=false, updated_at=now() WHERE id=v_sub.id;
  INSERT INTO subscription_deduction_logs (seller_id,subscription_id,amount,deduction_type,status,wallet_balance_before,wallet_balance_after) VALUES (p_seller_id,v_sub.id,v_fee,v_sub.plan_type,'success',v_wallet.current_balance,v_wallet.current_balance-v_fee);
  INSERT INTO notifications (user_id,title,message,notification_type,link) VALUES (p_seller_id,'✅ Fee Deducted','Rs. '||v_fee||' deducted. Next: '||to_char(v_next,'DD Mon YYYY'),'system','/seller-center/wallet');
  
  RETURN jsonb_build_object('success',true,'message','Deducted','amount',v_fee,'next_deduction',v_next);
END;
$$;

-- 10. Reactivation function
CREATE OR REPLACE FUNCTION public.check_and_reactivate_seller(p_seller_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_sub RECORD; v_wallet RECORD; v_pending numeric;
BEGIN
  SELECT * INTO v_sub FROM seller_subscriptions WHERE seller_id=p_seller_id AND account_suspended=true;
  IF v_sub IS NULL THEN RETURN jsonb_build_object('success',false,'message','Not suspended'); END IF;
  SELECT * INTO v_wallet FROM seller_wallets WHERE seller_id=p_seller_id;
  v_pending := COALESCE(v_sub.pending_amount,0);
  
  IF v_wallet.current_balance >= v_pending AND v_pending > 0 THEN
    INSERT INTO wallet_transactions (wallet_id,seller_id,transaction_type,gross_amount,net_amount,description) VALUES (v_wallet.id,p_seller_id,'platform_fee',v_pending,-v_pending,'Pending fees cleared');
    UPDATE seller_wallets SET current_balance=current_balance-v_pending, updated_at=now() WHERE id=v_wallet.id;
    UPDATE admin_wallet SET total_balance=total_balance+v_pending, total_subscription_earnings=total_subscription_earnings+v_pending, updated_at=now();
    INSERT INTO admin_wallet_transactions (transaction_type,amount,seller_id,subscription_id,description) VALUES ('subscription_fee',v_pending,p_seller_id,v_sub.id,'Pending fees on reactivation');
  END IF;
  
  UPDATE seller_subscriptions SET account_suspended=false, suspended_at=null, reactivated_at=now(), payment_pending=false, pending_amount=0, updated_at=now() WHERE id=v_sub.id;
  UPDATE products SET is_active=true WHERE seller_id=p_seller_id;
  INSERT INTO notifications (user_id,title,message,notification_type,link) VALUES (p_seller_id,'✅ Account Reactivated!','Products are visible again.','system','/seller-center/dashboard');
  RETURN jsonb_build_object('success',true,'message','Reactivated');
END;
$$;

-- 11. Admin PIN functions
CREATE OR REPLACE FUNCTION public.set_admin_wallet_pin(p_admin_id uuid, p_pin text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin(p_admin_id) THEN RETURN jsonb_build_object('success',false,'message','Unauthorized'); END IF;
  INSERT INTO admin_wallet (pin_hash,pin_set) VALUES (crypt(p_pin,gen_salt('bf')),true) ON CONFLICT DO NOTHING;
  UPDATE admin_wallet SET pin_hash=crypt(p_pin,gen_salt('bf')), pin_set=true, updated_at=now();
  RETURN jsonb_build_object('success',true,'message','PIN set');
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_admin_wallet_pin(p_admin_id uuid, p_pin text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_hash text;
BEGIN
  IF NOT is_super_admin(p_admin_id) THEN RETURN false; END IF;
  SELECT pin_hash INTO v_hash FROM admin_wallet LIMIT 1;
  IF v_hash IS NULL THEN RETURN false; END IF;
  RETURN v_hash = crypt(p_pin, v_hash);
END;
$$;

-- 12. Trigger for auto-creating subscription on seller verification
CREATE OR REPLACE FUNCTION public.create_seller_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_free integer; v_end timestamptz;
BEGIN
  IF NEW.verification_status='verified' AND (OLD.verification_status IS DISTINCT FROM 'verified') THEN
    SELECT COALESCE(CAST(setting_value AS integer),1) INTO v_free FROM admin_settings WHERE setting_key='new_seller_free_months';
    v_end := now() + (v_free||' months')::interval;
    INSERT INTO seller_subscriptions (seller_id,plan_type,subscription_type,free_months,free_period_start,free_period_end,is_in_free_period,next_deduction_at)
    VALUES (NEW.user_id,'daily','daily',v_free,now(),v_end,(v_free>0),CASE WHEN v_free>0 THEN v_end ELSE now()+INTERVAL '1 day' END)
    ON CONFLICT (seller_id) DO NOTHING;
    IF v_free > 0 THEN
      INSERT INTO notifications (user_id,title,message,notification_type,link) VALUES (NEW.user_id,'🎉 Free Period!',v_free||' free month(s) until '||to_char(v_end,'DD Mon YYYY'),'promotion','/seller-center/wallet');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_seller_verified_create_subscription ON public.seller_profiles;
CREATE TRIGGER on_seller_verified_create_subscription
  AFTER UPDATE ON public.seller_profiles FOR EACH ROW
  EXECUTE FUNCTION public.create_seller_subscription();

-- 13. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_plan_change_requests;

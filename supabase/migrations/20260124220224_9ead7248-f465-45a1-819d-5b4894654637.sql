-- Create seller_commissions table for custom commission rates and grace periods
CREATE TABLE public.seller_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_commission_percentage NUMERIC DEFAULT NULL,
  grace_period_months INTEGER DEFAULT 0,
  grace_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  grace_commission_percentage NUMERIC DEFAULT 0,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage seller commissions"
ON public.seller_commissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE POLICY "Sellers can view their own commission"
ON public.seller_commissions
FOR SELECT
USING (seller_id = auth.uid());

-- Function to get effective commission rate for a seller
CREATE OR REPLACE FUNCTION public.get_seller_commission_rate(p_seller_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission RECORD;
  v_global_rate NUMERIC;
  v_effective_rate NUMERIC;
BEGIN
  -- Get global commission rate
  SELECT CAST(setting_value AS NUMERIC) INTO v_global_rate
  FROM admin_settings
  WHERE setting_key = 'global_commission_percentage';
  
  IF v_global_rate IS NULL THEN
    v_global_rate := 10; -- Default 10%
  END IF;
  
  -- Get seller-specific commission settings
  SELECT * INTO v_commission FROM seller_commissions WHERE seller_id = p_seller_id;
  
  -- If no custom settings, return global rate
  IF v_commission IS NULL THEN
    RETURN v_global_rate;
  END IF;
  
  -- Check if grace period is active
  IF v_commission.grace_period_months > 0 AND v_commission.grace_start_date IS NOT NULL THEN
    IF now() < (v_commission.grace_start_date + (v_commission.grace_period_months || ' months')::INTERVAL) THEN
      RETURN COALESCE(v_commission.grace_commission_percentage, 0);
    END IF;
  END IF;
  
  -- Return custom rate if set, otherwise global
  RETURN COALESCE(v_commission.custom_commission_percentage, v_global_rate);
END;
$$;

-- Update process_order_earnings to use seller-specific commission
CREATE OR REPLACE FUNCTION public.process_order_earnings(p_order_id uuid, p_seller_id uuid, p_sale_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_net_amount DECIMAL;
  v_wallet_id UUID;
BEGIN
  -- Get seller-specific commission rate
  v_commission_rate := get_seller_commission_rate(p_seller_id);
  
  -- Calculate amounts
  v_commission_amount := ROUND(p_sale_amount * v_commission_rate / 100, 2);
  v_net_amount := p_sale_amount - v_commission_amount;
  
  -- Get or create wallet
  SELECT id INTO v_wallet_id FROM seller_wallets WHERE seller_id = p_seller_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO seller_wallets (seller_id) VALUES (p_seller_id)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Check if transaction already exists for this order
  IF EXISTS (
    SELECT 1 FROM wallet_transactions 
    WHERE order_id = p_order_id AND seller_id = p_seller_id AND transaction_type = 'earning'
  ) THEN
    RETURN;
  END IF;
  
  -- Insert earning transaction
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, order_id, transaction_type,
    gross_amount, commission_amount, commission_percentage, net_amount, description
  ) VALUES (
    v_wallet_id, p_seller_id, p_order_id, 'earning',
    p_sale_amount, v_commission_amount, v_commission_rate, v_net_amount,
    'Order earnings after delivery'
  );
  
  -- Update wallet balance
  UPDATE seller_wallets
  SET 
    current_balance = current_balance + v_net_amount,
    total_earnings = total_earnings + v_net_amount,
    updated_at = now()
  WHERE id = v_wallet_id;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_seller_commissions_updated_at
BEFORE UPDATE ON public.seller_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
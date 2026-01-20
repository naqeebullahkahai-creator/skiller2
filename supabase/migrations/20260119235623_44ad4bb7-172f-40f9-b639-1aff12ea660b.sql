
-- Create admin_settings table for global commission
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_settings
CREATE POLICY "Anyone can read settings"
ON public.admin_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings"
ON public.admin_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default commission rate
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES ('global_commission_percentage', '10', 'Platform commission percentage on each sale');

-- Create seller_wallets table
CREATE TABLE public.seller_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE,
  current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pending_clearance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_wallets
CREATE POLICY "Sellers can view their own wallet"
ON public.seller_wallets FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all wallets"
ON public.seller_wallets FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update wallets"
ON public.seller_wallets FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create transaction type enum
CREATE TYPE public.wallet_transaction_type AS ENUM (
  'earning',
  'commission_deduction',
  'withdrawal',
  'refund_deduction',
  'adjustment'
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.seller_wallets(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  transaction_type public.wallet_transaction_type NOT NULL,
  gross_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  commission_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallet_transactions
CREATE POLICY "Sellers can view their own transactions"
ON public.wallet_transactions FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
ON public.wallet_transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert transactions"
ON public.wallet_transactions FOR INSERT
WITH CHECK (true);

-- Create payout status enum
CREATE TYPE public.payout_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create payout_requests table
CREATE TABLE public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.seller_wallets(id),
  amount DECIMAL(12, 2) NOT NULL,
  bank_name TEXT NOT NULL,
  account_title TEXT NOT NULL,
  iban TEXT NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'pending',
  transaction_reference TEXT,
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for payout_requests
CREATE POLICY "Sellers can view their own payout requests"
ON public.payout_requests FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can create their own payout requests"
ON public.payout_requests FOR INSERT
WITH CHECK (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Admins can view all payout requests"
ON public.payout_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payout requests"
ON public.payout_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to create wallet for new sellers
CREATE OR REPLACE FUNCTION public.create_seller_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'seller' THEN
    INSERT INTO public.seller_wallets (seller_id)
    VALUES (NEW.user_id)
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to create wallet when seller role is assigned
CREATE TRIGGER on_seller_role_created
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.create_seller_wallet();

-- Function to process order earnings when delivered
CREATE OR REPLACE FUNCTION public.process_order_earnings(
  p_order_id UUID,
  p_seller_id UUID,
  p_sale_amount DECIMAL
)
RETURNS VOID
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
  -- Get commission rate
  SELECT CAST(setting_value AS DECIMAL) INTO v_commission_rate
  FROM admin_settings
  WHERE setting_key = 'global_commission_percentage';
  
  IF v_commission_rate IS NULL THEN
    v_commission_rate := 10; -- Default 10%
  END IF;
  
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
    RETURN; -- Already processed
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

-- Function to process refund deduction
CREATE OR REPLACE FUNCTION public.process_refund_deduction(
  p_order_id UUID,
  p_seller_id UUID,
  p_amount DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  SELECT id INTO v_wallet_id FROM seller_wallets WHERE seller_id = p_seller_id;
  
  IF v_wallet_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Insert refund deduction transaction
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, order_id, transaction_type,
    gross_amount, net_amount, description
  ) VALUES (
    v_wallet_id, p_seller_id, p_order_id, 'refund_deduction',
    p_amount, -p_amount, 'Refund deduction for returned/cancelled order'
  );
  
  -- Deduct from wallet
  UPDATE seller_wallets
  SET 
    current_balance = current_balance - p_amount,
    updated_at = now()
  WHERE id = v_wallet_id;
END;
$$;

-- Function to process payout
CREATE OR REPLACE FUNCTION public.process_payout(
  p_payout_id UUID,
  p_transaction_reference TEXT,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payout RECORD;
BEGIN
  -- Get payout request
  SELECT * INTO v_payout FROM payout_requests WHERE id = p_payout_id AND status = 'pending';
  
  IF v_payout IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if seller has enough balance
  IF NOT EXISTS (
    SELECT 1 FROM seller_wallets 
    WHERE seller_id = v_payout.seller_id AND current_balance >= v_payout.amount
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Insert withdrawal transaction
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, transaction_type,
    gross_amount, net_amount, description
  ) VALUES (
    v_payout.wallet_id, v_payout.seller_id, 'withdrawal',
    v_payout.amount, -v_payout.amount, 'Payout withdrawal - Ref: ' || p_transaction_reference
  );
  
  -- Deduct from wallet
  UPDATE seller_wallets
  SET 
    current_balance = current_balance - v_payout.amount,
    total_withdrawn = total_withdrawn + v_payout.amount,
    updated_at = now()
  WHERE seller_id = v_payout.seller_id;
  
  -- Update payout request
  UPDATE payout_requests
  SET 
    status = 'completed',
    transaction_reference = p_transaction_reference,
    processed_by = p_admin_id,
    processed_at = now(),
    updated_at = now()
  WHERE id = p_payout_id;
  
  RETURN TRUE;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_wallets_updated_at
BEFORE UPDATE ON public.seller_wallets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_requests_updated_at
BEFORE UPDATE ON public.payout_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

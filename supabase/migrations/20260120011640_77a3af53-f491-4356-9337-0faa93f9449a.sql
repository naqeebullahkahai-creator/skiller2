-- Create return_status enum
CREATE TYPE public.return_status AS ENUM (
  'return_requested',
  'under_review',
  'approved',
  'rejected',
  'item_shipped',
  'item_received',
  'refund_issued'
);

-- Create return_reason enum
CREATE TYPE public.return_reason AS ENUM (
  'wrong_item',
  'damaged',
  'quality_not_as_expected',
  'size_fit_issue',
  'changed_mind',
  'other'
);

-- Create return_requests table
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  reason return_reason NOT NULL,
  additional_comments TEXT,
  photos TEXT[] DEFAULT '{}',
  status return_status NOT NULL DEFAULT 'return_requested',
  refund_amount DECIMAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  seller_response TEXT,
  seller_responded_at TIMESTAMP WITH TIME ZONE,
  admin_decision TEXT,
  admin_decided_at TIMESTAMP WITH TIME ZONE,
  admin_id UUID,
  tracking_number TEXT,
  refund_processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT one_return_per_item UNIQUE (order_item_id)
);

-- Create customer_wallets table
CREATE TABLE public.customer_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE,
  balance DECIMAL NOT NULL DEFAULT 0,
  total_refunds DECIMAL NOT NULL DEFAULT 0,
  total_spent DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_wallet_transactions table
CREATE TABLE public.customer_wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.customer_wallets(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('refund', 'payment', 'adjustment')),
  amount DECIMAL NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  return_request_id UUID REFERENCES public.return_requests(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_logs table for PKR auditing
CREATE TABLE public.financial_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_type TEXT NOT NULL CHECK (log_type IN ('order_payment', 'refund', 'commission', 'payout', 'adjustment')),
  order_id UUID REFERENCES public.orders(id),
  return_request_id UUID REFERENCES public.return_requests(id),
  customer_id UUID,
  seller_id UUID,
  amount_pkr DECIMAL NOT NULL,
  commission_amount_pkr DECIMAL DEFAULT 0,
  net_amount_pkr DECIMAL NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX idx_return_requests_customer_id ON public.return_requests(customer_id);
CREATE INDEX idx_return_requests_seller_id ON public.return_requests(seller_id);
CREATE INDEX idx_return_requests_status ON public.return_requests(status);
CREATE INDEX idx_customer_wallets_customer_id ON public.customer_wallets(customer_id);
CREATE INDEX idx_financial_logs_order_id ON public.financial_logs(order_id);

-- Enable RLS
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_logs ENABLE ROW LEVEL SECURITY;

-- RLS for return_requests
CREATE POLICY "Customers can view their own returns"
  ON public.return_requests FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create returns for their orders"
  ON public.return_requests FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Sellers can view returns for their products"
  ON public.return_requests FOR SELECT
  USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'));

CREATE POLICY "Sellers can update returns for their products"
  ON public.return_requests FOR UPDATE
  USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'));

CREATE POLICY "Admins can view all returns"
  ON public.return_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all returns"
  ON public.return_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS for customer_wallets
CREATE POLICY "Customers can view their own wallet"
  ON public.customer_wallets FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all wallets"
  ON public.customer_wallets FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert wallets"
  ON public.customer_wallets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update wallets"
  ON public.customer_wallets FOR UPDATE
  USING (true);

-- RLS for customer_wallet_transactions
CREATE POLICY "Customers can view their own transactions"
  ON public.customer_wallet_transactions FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all transactions"
  ON public.customer_wallet_transactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert transactions"
  ON public.customer_wallet_transactions FOR INSERT
  WITH CHECK (true);

-- RLS for financial_logs
CREATE POLICY "Admins can view all financial logs"
  ON public.financial_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert financial logs"
  ON public.financial_logs FOR INSERT
  WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_wallets_updated_at
  BEFORE UPDATE ON public.customer_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to process refund
CREATE OR REPLACE FUNCTION public.process_customer_refund(
  p_return_request_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_return RECORD;
  v_wallet_id UUID;
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_seller_deduction DECIMAL;
BEGIN
  -- Get return request
  SELECT * INTO v_return FROM return_requests 
  WHERE id = p_return_request_id AND status = 'item_received';
  
  IF v_return IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already refunded
  IF EXISTS (SELECT 1 FROM customer_wallet_transactions WHERE return_request_id = p_return_request_id) THEN
    RETURN FALSE; -- Already refunded
  END IF;
  
  -- Get or create customer wallet
  SELECT id INTO v_wallet_id FROM customer_wallets WHERE customer_id = v_return.customer_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO customer_wallets (customer_id, balance) 
    VALUES (v_return.customer_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Get commission rate
  SELECT CAST(setting_value AS DECIMAL) INTO v_commission_rate
  FROM admin_settings WHERE setting_key = 'global_commission_percentage';
  IF v_commission_rate IS NULL THEN v_commission_rate := 10; END IF;
  
  -- Calculate commission that was taken
  v_commission_amount := ROUND(v_return.refund_amount * v_commission_rate / 100, 2);
  v_seller_deduction := v_return.refund_amount - v_commission_amount;
  
  -- Add refund to customer wallet
  INSERT INTO customer_wallet_transactions (
    wallet_id, customer_id, transaction_type, amount, 
    order_id, return_request_id, description
  ) VALUES (
    v_wallet_id, v_return.customer_id, 'refund', v_return.refund_amount,
    v_return.order_id, p_return_request_id, 
    'Refund for return request'
  );
  
  UPDATE customer_wallets
  SET balance = balance + v_return.refund_amount,
      total_refunds = total_refunds + v_return.refund_amount,
      updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Deduct from seller wallet (reverse the earnings)
  INSERT INTO wallet_transactions (
    wallet_id, seller_id, order_id, transaction_type,
    gross_amount, commission_amount, commission_percentage, net_amount, description
  )
  SELECT 
    sw.id, v_return.seller_id, v_return.order_id, 'refund_deduction',
    v_return.refund_amount, v_commission_amount, v_commission_rate, -v_seller_deduction,
    'Refund deduction for return - Order item returned'
  FROM seller_wallets sw WHERE sw.seller_id = v_return.seller_id;
  
  UPDATE seller_wallets
  SET current_balance = current_balance - v_seller_deduction,
      updated_at = now()
  WHERE seller_id = v_return.seller_id;
  
  -- Log the financial transaction
  INSERT INTO financial_logs (
    log_type, order_id, return_request_id, customer_id, seller_id,
    amount_pkr, commission_amount_pkr, net_amount_pkr, description, metadata
  ) VALUES (
    'refund', v_return.order_id, p_return_request_id, v_return.customer_id, v_return.seller_id,
    v_return.refund_amount, v_commission_amount, v_seller_deduction,
    'Customer refund processed',
    jsonb_build_object('admin_id', p_admin_id, 'commission_rate', v_commission_rate)
  );
  
  -- Update return request status
  UPDATE return_requests
  SET status = 'refund_issued',
      refund_processed_at = now(),
      updated_at = now()
  WHERE id = p_return_request_id;
  
  RETURN TRUE;
END;
$$;

-- Function to check if return is within 7 days
CREATE OR REPLACE FUNCTION public.can_request_return(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN RETURN FALSE; END IF;
  IF v_order.order_status != 'delivered' THEN RETURN FALSE; END IF;
  
  -- Check if within 7 days of last update (delivery)
  IF v_order.updated_at + INTERVAL '7 days' < now() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;
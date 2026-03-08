
-- Per-product commission settings (set when admin approves product)
CREATE TABLE public.product_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  commission_type TEXT NOT NULL DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  set_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Commission wallet (separate from admin_wallet, only commission earnings)
CREATE TABLE public.commission_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commission transaction history
CREATE TABLE public.commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id),
  order_id UUID REFERENCES public.orders(id),
  seller_id UUID NOT NULL,
  commission_type TEXT NOT NULL,
  commission_value NUMERIC(10,2) NOT NULL,
  sale_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  product_title TEXT,
  seller_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can manage
CREATE POLICY "Admins manage product_commissions" ON public.product_commissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage commission_wallet" ON public.commission_wallet
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view commission_transactions" ON public.commission_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sellers can see their own product commissions
CREATE POLICY "Sellers view own product_commissions" ON public.product_commissions
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Sellers can see their own commission transactions
CREATE POLICY "Sellers view own commission_transactions" ON public.commission_transactions
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Insert initial commission wallet row
INSERT INTO public.commission_wallet (total_balance, total_earned) VALUES (0, 0);

-- Function: process commission when order is delivered
CREATE OR REPLACE FUNCTION public.process_product_commission(p_order_id UUID, p_product_id UUID, p_seller_id UUID, p_sale_amount NUMERIC)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pc RECORD;
  v_commission NUMERIC;
  v_product_title TEXT;
  v_seller_name TEXT;
BEGIN
  -- Get commission settings for this product
  SELECT * INTO v_pc FROM product_commissions WHERE product_id = p_product_id;
  
  IF v_pc IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No commission set for this product');
  END IF;
  
  -- Calculate commission
  IF v_pc.commission_type = 'percentage' THEN
    v_commission := ROUND(p_sale_amount * v_pc.commission_value / 100, 2);
  ELSE
    v_commission := v_pc.commission_value;
  END IF;
  
  -- Get product title and seller name
  SELECT title INTO v_product_title FROM products WHERE id = p_product_id;
  SELECT full_name INTO v_seller_name FROM profiles WHERE id = p_seller_id;
  
  -- Record transaction
  INSERT INTO commission_transactions (product_id, order_id, seller_id, commission_type, commission_value, sale_amount, commission_amount, product_title, seller_name)
  VALUES (p_product_id, p_order_id, p_seller_id, v_pc.commission_type, v_pc.commission_value, p_sale_amount, v_commission, v_product_title, v_seller_name);
  
  -- Update commission wallet
  UPDATE commission_wallet SET total_balance = total_balance + v_commission, total_earned = total_earned + v_commission, updated_at = now();
  
  RETURN jsonb_build_object('success', true, 'commission_amount', v_commission, 'commission_type', v_pc.commission_type);
END;
$$;

-- Enable realtime for commission_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_transactions;

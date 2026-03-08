
-- Separate Subscription Fee Wallet (only subscription fee earnings)
CREATE TABLE public.subscription_fee_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_sellers_paid INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription fee transaction history (mirrors subscription_deduction_logs but for admin wallet view)
CREATE TABLE public.subscription_fee_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  seller_name TEXT,
  plan_type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  deduction_log_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_fee_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_fee_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage subscription_fee_wallet" ON public.subscription_fee_wallet
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view subscription_fee_transactions" ON public.subscription_fee_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sellers can see their own subscription fee transactions
CREATE POLICY "Sellers view own subscription_fee_transactions" ON public.subscription_fee_transactions
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Insert initial wallet row
INSERT INTO public.subscription_fee_wallet (total_balance, total_earned) VALUES (0, 0);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_fee_transactions;

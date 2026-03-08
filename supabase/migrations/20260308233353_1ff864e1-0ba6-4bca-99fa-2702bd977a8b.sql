
-- Admin Store Settings
CREATE TABLE public.admin_store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'FANZON Official Store',
  store_description TEXT DEFAULT 'Official products from FANZON',
  store_logo_url TEXT,
  store_banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Store Wallet (separate from admin_wallet)
CREATE TABLE public.admin_store_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_balance NUMERIC NOT NULL DEFAULT 0,
  total_earnings NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Store Transactions
CREATE TABLE public.admin_store_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'sale',
  description TEXT,
  product_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_store_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_store_transactions ENABLE ROW LEVEL SECURITY;

-- Admin-only RLS policies
CREATE POLICY "Admin can manage store settings" ON public.admin_store_settings FOR ALL TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Admin can manage store wallet" ON public.admin_store_wallet FOR ALL TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Admin can manage store transactions" ON public.admin_store_transactions FOR ALL TO authenticated USING (public.is_super_admin(auth.uid()));

-- Mark admin products: add is_admin_product flag to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_admin_product BOOLEAN NOT NULL DEFAULT false;

-- Insert default store settings
INSERT INTO public.admin_store_settings (store_name) VALUES ('FANZON Official Store');

-- Insert default store wallet
INSERT INTO public.admin_store_wallet (total_balance) VALUES (0);

-- Enable realtime for admin store transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_store_transactions;

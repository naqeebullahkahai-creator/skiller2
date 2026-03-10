
-- Withdrawal methods defined by admin
CREATE TABLE public.withdrawal_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_methods ENABLE ROW LEVEL SECURITY;

-- Everyone can read active methods
CREATE POLICY "Anyone can view active withdrawal methods"
  ON public.withdrawal_methods FOR SELECT
  USING (true);

-- Only super admin can manage
CREATE POLICY "Super admin can manage withdrawal methods"
  ON public.withdrawal_methods FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Seller saved wallets
CREATE TABLE public.seller_saved_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_id UUID NOT NULL REFERENCES public.withdrawal_methods(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_saved_wallets ENABLE ROW LEVEL SECURITY;

-- Sellers can manage their own wallets
CREATE POLICY "Sellers can view own saved wallets"
  ON public.seller_saved_wallets FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert own saved wallets"
  ON public.seller_saved_wallets FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own saved wallets"
  ON public.seller_saved_wallets FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own saved wallets"
  ON public.seller_saved_wallets FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Admin can view all saved wallets (for payout processing)
CREATE POLICY "Admin can view all saved wallets"
  ON public.seller_saved_wallets FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Add saved_wallet_id to payout_requests
ALTER TABLE public.payout_requests ADD COLUMN IF NOT EXISTS saved_wallet_id UUID REFERENCES public.seller_saved_wallets(id);

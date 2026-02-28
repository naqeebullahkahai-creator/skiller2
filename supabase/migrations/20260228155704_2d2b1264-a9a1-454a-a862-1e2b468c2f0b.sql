
-- 1. Brands table (dynamic, admin-managed + seller-contributed)
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands are viewable by everyone" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Sellers can insert brands" ON public.brands FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'seller'));

-- Seed popular Pakistani + global brands
INSERT INTO public.brands (name, slug) VALUES
  ('Samsung', 'samsung'), ('Apple', 'apple'), ('Nike', 'nike'), ('Adidas', 'adidas'),
  ('Sony', 'sony'), ('LG', 'lg'), ('Xiaomi', 'xiaomi'), ('Puma', 'puma'),
  ('Huawei', 'huawei'), ('Oppo', 'oppo'), ('Vivo', 'vivo'), ('Realme', 'realme'),
  ('Haier', 'haier'), ('Dawlance', 'dawlance'), ('Pel', 'pel'), ('Orient', 'orient'),
  ('Gul Ahmed', 'gul-ahmed'), ('Khaadi', 'khaadi'), ('Junaid Jamshed', 'junaid-jamshed'),
  ('Sapphire', 'sapphire'), ('Alkaram', 'alkaram'), ('Bonanza', 'bonanza'),
  ('Outfitters', 'outfitters'), ('Levi''s', 'levis'), ('Zara', 'zara'),
  ('H&M', 'h-and-m'), ('Reebok', 'reebok'), ('Skechers', 'skechers'),
  ('Bata', 'bata'), ('Service', 'service'), ('Servis', 'servis'),
  ('Unilever', 'unilever'), ('Nestle', 'nestle'), ('Shan', 'shan'),
  ('National', 'national'), ('Olpers', 'olpers'), ('Tapal', 'tapal'),
  ('Other', 'other')
ON CONFLICT DO NOTHING;

-- 2. Add support_agent to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_agent';

-- 3. Per-order fee settings (already added per_order_fee_enabled + per_order_fee_amount in previous migration)
-- Add process_per_order_fee function
CREATE OR REPLACE FUNCTION public.process_per_order_fee(p_order_id UUID, p_seller_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_enabled BOOLEAN;
  v_fee NUMERIC;
  v_wallet_id UUID;
  v_balance NUMERIC;
BEGIN
  -- Check if per-order fee is enabled
  SELECT setting_value = 'true' INTO v_enabled FROM admin_settings WHERE setting_key = 'per_order_fee_enabled';
  IF NOT COALESCE(v_enabled, false) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Per-order fee disabled');
  END IF;

  -- Get fee amount
  SELECT CAST(setting_value AS NUMERIC) INTO v_fee FROM admin_settings WHERE setting_key = 'per_order_fee_amount';
  v_fee := COALESCE(v_fee, 0);
  IF v_fee <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Fee amount is zero');
  END IF;

  -- Get seller wallet
  SELECT id, current_balance INTO v_wallet_id, v_balance FROM seller_wallets WHERE seller_id = p_seller_id;
  IF v_wallet_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Seller wallet not found');
  END IF;

  -- Deduct fee (even if balance goes negative, record it)
  INSERT INTO wallet_transactions (wallet_id, seller_id, transaction_type, gross_amount, net_amount, order_id, description)
  VALUES (v_wallet_id, p_seller_id, 'platform_fee', v_fee, -v_fee, p_order_id, 'Per-order fee Rs.' || v_fee);

  UPDATE seller_wallets SET current_balance = current_balance - v_fee, updated_at = now() WHERE id = v_wallet_id;

  -- Credit admin wallet
  UPDATE admin_wallet SET total_balance = total_balance + v_fee, total_commission_earnings = total_commission_earnings + v_fee, updated_at = now();

  INSERT INTO admin_wallet_transactions (transaction_type, amount, seller_id, description)
  VALUES ('commission', v_fee, p_seller_id, 'Per-order fee from order ' || p_order_id::text);

  RETURN jsonb_build_object('success', true, 'fee_amount', v_fee);
END;
$$;

-- 4. Support agent tables
CREATE TABLE public.support_agent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  max_concurrent_chats INT DEFAULT 5,
  total_resolved INT DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.support_agent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own profile" ON public.support_agent_profiles FOR SELECT USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "Agents can update own profile" ON public.support_agent_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage agent profiles" ON public.support_agent_profiles FOR ALL USING (public.is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_agent_profiles_updated_at BEFORE UPDATE ON public.support_agent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

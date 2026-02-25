
-- ============================================
-- 1. COINS / REWARDS SYSTEM
-- ============================================
CREATE TABLE public.coin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coin_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coin wallet" ON public.coin_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert coin wallets" ON public.coin_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update coin wallets" ON public.coin_wallets FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned_purchase', 'earned_review', 'earned_game', 'redeemed', 'expired', 'admin_credit', 'admin_debit'
  description TEXT,
  reference_id UUID,
  reference_type TEXT, -- 'order', 'review', 'game', 'admin'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coin transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert coin transactions" ON public.coin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coin settings (admin)
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('coins_per_100_pkr', '1', 'Coins earned per 100 PKR spent'),
  ('coins_per_review', '5', 'Coins earned per product review'),
  ('coin_to_pkr_rate', '1', 'PKR value of 1 coin for redemption'),
  ('coins_enabled', 'true', 'Enable/disable coins system'),
  ('max_coins_redeem_percent', '10', 'Max % of order payable with coins')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 2. OFFICIAL STORE BADGES
-- ============================================
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS is_official_store BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS official_store_badge TEXT DEFAULT null; -- 'mall', 'preferred', 'top_rated'
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS official_store_approved_at TIMESTAMPTZ;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS official_store_approved_by UUID;

-- ============================================
-- 3. BUNDLE DEALS
-- ============================================
CREATE TABLE public.bundle_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  bundle_type TEXT NOT NULL DEFAULT 'combo', -- 'combo', 'buy_x_get_y', 'percentage_off'
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bundle_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active bundles" ON public.bundle_deals FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own bundles" ON public.bundle_deals FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own bundles" ON public.bundle_deals FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own bundles" ON public.bundle_deals FOR DELETE USING (auth.uid() = seller_id);
CREATE POLICY "Admins can view all bundles" ON public.bundle_deals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundle_deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bundle items" ON public.bundle_items FOR SELECT USING (true);
CREATE POLICY "Sellers can manage bundle items" ON public.bundle_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.bundle_deals WHERE id = bundle_id AND seller_id = auth.uid())
);
CREATE POLICY "Sellers can delete bundle items" ON public.bundle_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.bundle_deals WHERE id = bundle_id AND seller_id = auth.uid())
);

-- ============================================
-- 4. IN-APP GAMES (Spin Wheel)
-- ============================================
CREATE TABLE public.spin_wheel_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL, -- 'Better Luck', '5 Coins', '10% Off', etc.
  reward_type TEXT NOT NULL, -- 'coins', 'voucher', 'nothing', 'free_shipping'
  reward_value NUMERIC(10,2) DEFAULT 0,
  probability NUMERIC(5,2) NOT NULL DEFAULT 10, -- percentage chance
  color TEXT DEFAULT '#F85606',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spin_wheel_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view spin config" ON public.spin_wheel_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage spin config" ON public.spin_wheel_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.spin_wheel_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  config_id UUID REFERENCES public.spin_wheel_config(id),
  reward_type TEXT,
  reward_value NUMERIC(10,2) DEFAULT 0,
  reward_label TEXT,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spin_wheel_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own spins" ON public.spin_wheel_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert spins" ON public.spin_wheel_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('spin_wheel_enabled', 'true', 'Enable/disable spin wheel game'),
  ('daily_spins_limit', '1', 'Max spins per user per day'),
  ('spin_cost_coins', '0', 'Coins required per spin (0 = free)')
ON CONFLICT (setting_key) DO NOTHING;

-- Default spin wheel segments
INSERT INTO public.spin_wheel_config (label, reward_type, reward_value, probability, color) VALUES
  ('5 Coins', 'coins', 5, 25, '#F85606'),
  ('10 Coins', 'coins', 10, 15, '#FF8C00'),
  ('20 Coins', 'coins', 20, 5, '#FFD700'),
  ('5% Off', 'voucher', 5, 20, '#00a862'),
  ('10% Off', 'voucher', 10, 5, '#2563eb'),
  ('Free Shipping', 'free_shipping', 0, 10, '#8b5cf6'),
  ('Better Luck!', 'nothing', 0, 15, '#94a3b8'),
  ('Try Again', 'nothing', 0, 5, '#64748b');

-- ============================================
-- 5. PREMIUM MEMBERSHIP (FANZON Plus)
-- ============================================
CREATE TABLE public.premium_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  price_pkr NUMERIC(10,2) NOT NULL DEFAULT 299,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  benefits JSONB DEFAULT '{"free_delivery": true, "priority_support": true, "extra_coins_multiplier": 2, "exclusive_deals": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.premium_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own membership" ON public.premium_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert membership" ON public.premium_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update membership" ON public.premium_memberships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all memberships" ON public.premium_memberships FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update memberships" ON public.premium_memberships FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('premium_enabled', 'true', 'Enable/disable premium membership'),
  ('premium_monthly_price', '299', 'Monthly premium membership price in PKR'),
  ('premium_yearly_price', '2499', 'Yearly premium membership price in PKR'),
  ('premium_coins_multiplier', '2', 'Coin earning multiplier for premium members')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 6. CAMPAIGN / SALE PAGES
-- ============================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image_url TEXT,
  mobile_banner_url TEXT,
  theme_color TEXT DEFAULT '#F85606',
  campaign_type TEXT NOT NULL DEFAULT 'sale', -- 'sale', 'mega_sale', 'seasonal', 'brand'
  discount_label TEXT, -- 'Up to 70% Off', etc.
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.campaign_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  campaign_price_pkr NUMERIC(10,2),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, product_id)
);
ALTER TABLE public.campaign_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view campaign products" ON public.campaign_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage campaign products" ON public.campaign_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. SPONSORED PRODUCTS / SELLER ADS
-- ============================================
CREATE TABLE public.sponsored_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  budget_pkr NUMERIC(10,2) NOT NULL DEFAULT 0,
  spent_pkr NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_per_click_pkr NUMERIC(10,2) NOT NULL DEFAULT 2,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'paused', 'exhausted', 'rejected'
  placement TEXT DEFAULT 'search', -- 'search', 'home', 'category', 'product_page'
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsored_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can manage own ads" ON public.sponsored_products FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Anyone can view active sponsored" ON public.sponsored_products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all ads" ON public.sponsored_products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('sponsored_enabled', 'true', 'Enable/disable sponsored products'),
  ('min_ad_budget_pkr', '100', 'Minimum ad budget in PKR'),
  ('default_cpc_pkr', '2', 'Default cost per click in PKR')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 8. DAILY COLLECTIBLE COUPONS
-- ============================================
CREATE TABLE public.daily_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value NUMERIC(10,2) NOT NULL,
  min_spend_pkr NUMERIC(10,2) DEFAULT 0,
  max_discount_pkr NUMERIC(10,2),
  valid_for_hours INTEGER NOT NULL DEFAULT 24,
  max_collections INTEGER DEFAULT 100,
  current_collections INTEGER NOT NULL DEFAULT 0,
  available_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category_restriction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily coupons" ON public.daily_coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage daily coupons" ON public.daily_coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.collected_daily_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_id UUID NOT NULL REFERENCES public.daily_coupons(id) ON DELETE CASCADE,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, coupon_id)
);
ALTER TABLE public.collected_daily_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collected coupons" ON public.collected_daily_coupons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can collect coupons" ON public.collected_daily_coupons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own coupons" ON public.collected_daily_coupons FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 9. MULTI-COURIER INTEGRATION
-- ============================================
CREATE TABLE public.couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 'tcs', 'leopards', 'dhl', 'postex', etc.
  logo_url TEXT,
  tracking_url_template TEXT, -- 'https://track.tcs.com.pk/?cn={tracking_id}'
  is_active BOOLEAN NOT NULL DEFAULT true,
  supports_cod BOOLEAN NOT NULL DEFAULT true,
  base_rate_pkr NUMERIC(10,2) DEFAULT 0,
  per_kg_rate_pkr NUMERIC(10,2) DEFAULT 0,
  estimated_days TEXT DEFAULT '3-5 days',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active couriers" ON public.couriers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage couriers" ON public.couriers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add courier_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_id UUID REFERENCES public.couriers(id);

-- Default couriers
INSERT INTO public.couriers (name, code, tracking_url_template, estimated_days, display_order) VALUES
  ('TCS', 'tcs', 'https://www.tcs.com.pk/tracking?cn={tracking_id}', '2-4 days', 1),
  ('Leopards Courier', 'leopards', 'https://leopardscourier.com/tracking/{tracking_id}', '2-5 days', 2),
  ('PostEx', 'postex', 'https://postex.pk/track/{tracking_id}', '3-5 days', 3),
  ('M&P', 'mnp', 'https://mnpcourier.com/tracking/{tracking_id}', '3-6 days', 4),
  ('Rider', 'rider', 'https://rider.pk/track/{tracking_id}', '1-3 days', 5);

-- ============================================
-- 10. INSTALLMENT / EMI PAYMENTS
-- ============================================
CREATE TABLE public.installment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  months INTEGER NOT NULL, -- 3, 6, 12
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- 0 for interest-free
  min_order_amount_pkr NUMERIC(10,2) NOT NULL DEFAULT 5000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view installment plans" ON public.installment_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.installment_plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.installment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  plan_id UUID NOT NULL REFERENCES public.installment_plans(id),
  total_amount_pkr NUMERIC(12,2) NOT NULL,
  monthly_amount_pkr NUMERIC(12,2) NOT NULL,
  paid_installments INTEGER NOT NULL DEFAULT 0,
  total_installments INTEGER NOT NULL,
  next_due_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'overdue', 'defaulted'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installment_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own installments" ON public.installment_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create installments" ON public.installment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all installments" ON public.installment_orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update installments" ON public.installment_orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.installment_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installment_order_id UUID NOT NULL REFERENCES public.installment_orders(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount_pkr NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.installment_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.installment_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.installment_orders WHERE id = installment_order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage payments" ON public.installment_payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.installment_plans (name, months, interest_rate, min_order_amount_pkr) VALUES
  ('3 Month Easy Plan', 3, 0, 3000),
  ('6 Month Plan', 6, 5, 5000),
  ('12 Month Plan', 12, 10, 10000);

INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('installments_enabled', 'true', 'Enable/disable installment payments')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 11. GROUP BUY
-- ============================================
CREATE TABLE public.group_buy_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  original_price_pkr NUMERIC(10,2) NOT NULL,
  group_price_pkr NUMERIC(10,2) NOT NULL,
  min_participants INTEGER NOT NULL DEFAULT 3,
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'fulfilled', 'expired', 'cancelled'
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_buy_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active group deals" ON public.group_buy_deals FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own group deals" ON public.group_buy_deals FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own group deals" ON public.group_buy_deals FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Admins can manage all group deals" ON public.group_buy_deals FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.group_buy_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.group_buy_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'joined', -- 'joined', 'confirmed', 'cancelled'
  UNIQUE(deal_id, user_id)
);
ALTER TABLE public.group_buy_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view participants" ON public.group_buy_participants FOR SELECT USING (true);
CREATE POLICY "Users can join group buy" ON public.group_buy_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave group buy" ON public.group_buy_participants FOR DELETE USING (auth.uid() = user_id);

INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
  ('group_buy_enabled', 'true', 'Enable/disable group buy feature')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 12. SIZE GUIDES
-- ============================================
CREATE TABLE public.size_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'shirts', 'pants', 'shoes', 'dresses'
  name TEXT NOT NULL,
  size_chart JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{size: 'S', chest: '36', waist: '30'}, ...]
  measurement_unit TEXT NOT NULL DEFAULT 'inches', -- 'inches', 'cm'
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.size_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view size guides" ON public.size_guides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage size guides" ON public.size_guides FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Link products to size guides
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_guide_id UUID REFERENCES public.size_guides(id);

-- Default size guides
INSERT INTO public.size_guides (category, name, size_chart, measurement_unit) VALUES
  ('shirts', 'Men''s Shirts', '[{"size":"S","chest":"36","length":"27","shoulder":"16"},{"size":"M","chest":"38","length":"28","shoulder":"17"},{"size":"L","chest":"40","length":"29","shoulder":"18"},{"size":"XL","chest":"42","length":"30","shoulder":"19"},{"size":"XXL","chest":"44","length":"31","shoulder":"20"}]'::jsonb, 'inches'),
  ('shoes', 'Men''s Shoes', '[{"size":"6","eu":"39","cm":"24.5"},{"size":"7","eu":"40","cm":"25.5"},{"size":"8","eu":"41","cm":"26"},{"size":"9","eu":"42","cm":"27"},{"size":"10","eu":"43","cm":"28"},{"size":"11","eu":"44","cm":"29"}]'::jsonb, 'cm'),
  ('pants', 'Men''s Pants', '[{"size":"28","waist":"28","hip":"36","length":"40"},{"size":"30","waist":"30","hip":"38","length":"41"},{"size":"32","waist":"32","hip":"40","length":"42"},{"size":"34","waist":"34","hip":"42","length":"43"},{"size":"36","waist":"36","hip":"44","length":"44"}]'::jsonb, 'inches');

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE TRIGGER update_coin_wallets_updated_at BEFORE UPDATE ON public.coin_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bundle_deals_updated_at BEFORE UPDATE ON public.bundle_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_spin_wheel_config_updated_at BEFORE UPDATE ON public.spin_wheel_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_premium_memberships_updated_at BEFORE UPDATE ON public.premium_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sponsored_products_updated_at BEFORE UPDATE ON public.sponsored_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_couriers_updated_at BEFORE UPDATE ON public.couriers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installment_orders_updated_at BEFORE UPDATE ON public.installment_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_group_buy_deals_updated_at BEFORE UPDATE ON public.group_buy_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_size_guides_updated_at BEFORE UPDATE ON public.size_guides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Flash Sales Campaigns
CREATE TABLE public.flash_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flash Sale Products (junction table)
CREATE TABLE public.flash_sale_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flash_sale_id UUID NOT NULL REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  flash_price_pkr DECIMAL NOT NULL,
  original_price_pkr DECIMAL NOT NULL,
  stock_limit INTEGER NOT NULL DEFAULT 100,
  sold_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flash_sale_id, product_id)
);

-- Vouchers/Promo Codes
CREATE TYPE public.discount_type AS ENUM ('fixed', 'percentage');

CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL NOT NULL,
  minimum_spend_pkr DECIMAL NOT NULL DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voucher Usage Tracking
CREATE TABLE public.voucher_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hero Banners
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'category',
  link_value TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Recently Viewed (for Just For You)
CREATE TABLE public.user_recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Notifications
CREATE TYPE public.notification_type AS ENUM ('order', 'price_drop', 'promotion', 'system');

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type notification_type NOT NULL DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Flash Sales Policies
CREATE POLICY "Anyone can view active flash sales" ON public.flash_sales
  FOR SELECT USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can manage flash sales" ON public.flash_sales
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Flash Sale Products Policies
CREATE POLICY "Anyone can view flash sale products" ON public.flash_sale_products
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.flash_sales 
    WHERE id = flash_sale_id AND is_active = true AND now() BETWEEN start_date AND end_date
  ));

CREATE POLICY "Admins can manage flash sale products" ON public.flash_sale_products
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Vouchers Policies
CREATE POLICY "Anyone can view active vouchers" ON public.vouchers
  FOR SELECT USING (is_active = true AND expiry_date > now());

CREATE POLICY "Admins can manage vouchers" ON public.vouchers
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Voucher Usage Policies
CREATE POLICY "Users can view their own usage" ON public.voucher_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" ON public.voucher_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Hero Banners Policies
CREATE POLICY "Anyone can view active banners" ON public.hero_banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage banners" ON public.hero_banners
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Recently Viewed Policies
CREATE POLICY "Users can manage their own views" ON public.user_recently_viewed
  FOR ALL USING (user_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Function to increment flash sale sold count
CREATE OR REPLACE FUNCTION public.increment_flash_sale_sold(p_flash_sale_id UUID, p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.flash_sale_products
  SET sold_count = sold_count + p_quantity
  WHERE flash_sale_id = p_flash_sale_id AND product_id = p_product_id;
  RETURN FOUND;
END;
$$;

-- Function to validate and use voucher
CREATE OR REPLACE FUNCTION public.validate_voucher(p_code TEXT, p_user_id UUID, p_order_total DECIMAL)
RETURNS TABLE(valid BOOLEAN, discount_amount DECIMAL, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voucher RECORD;
  v_usage_count INTEGER;
  v_discount DECIMAL;
BEGIN
  -- Find voucher
  SELECT * INTO v_voucher FROM public.vouchers 
  WHERE UPPER(code) = UPPER(p_code) AND is_active = true AND expiry_date > now();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Invalid or expired voucher code'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum spend
  IF p_order_total < v_voucher.minimum_spend_pkr THEN
    RETURN QUERY SELECT false, 0::DECIMAL, ('Minimum spend of Rs. ' || v_voucher.minimum_spend_pkr || ' required')::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_voucher.usage_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usage_count FROM public.voucher_usage WHERE voucher_id = v_voucher.id;
    IF v_usage_count >= v_voucher.usage_limit THEN
      RETURN QUERY SELECT false, 0::DECIMAL, 'Voucher usage limit reached'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check if user already used this voucher
  SELECT COUNT(*) INTO v_usage_count FROM public.voucher_usage 
  WHERE voucher_id = v_voucher.id AND user_id = p_user_id;
  IF v_usage_count > 0 THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'You have already used this voucher'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_voucher.discount_type = 'percentage' THEN
    v_discount := p_order_total * (v_voucher.discount_value / 100);
  ELSE
    v_discount := v_voucher.discount_value;
  END IF;
  
  -- Cap discount at order total
  IF v_discount > p_order_total THEN
    v_discount := p_order_total;
  END IF;
  
  RETURN QUERY SELECT true, v_discount, ('Discount of Rs. ' || v_discount || ' applied!')::TEXT;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_flash_sales_updated_at
  BEFORE UPDATE ON public.flash_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hero_banners_updated_at
  BEFORE UPDATE ON public.hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
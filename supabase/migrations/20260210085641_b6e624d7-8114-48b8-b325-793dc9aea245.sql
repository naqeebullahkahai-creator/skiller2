
-- =============================================
-- 1. RECENTLY VIEWED PRODUCTS
-- =============================================
CREATE TABLE public.recently_viewed_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.recently_viewed_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON public.recently_viewed_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.recently_viewed_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON public.recently_viewed_products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.recently_viewed_products
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_recently_viewed_user ON public.recently_viewed_products(user_id, viewed_at DESC);

-- =============================================
-- 2. REFERRAL / AFFILIATE SYSTEM
-- =============================================
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  commission_percentage NUMERIC NOT NULL DEFAULT 5,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_earnings_pkr NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can look up active codes" ON public.referral_codes
  FOR SELECT USING (is_active = true);

CREATE TABLE public.referral_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  commission_amount_pkr NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referral_tracking
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals" ON public.referral_tracking
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_referral_tracking_referrer ON public.referral_tracking(referrer_id);

-- =============================================
-- 3. CHATBOT FAQ KNOWLEDGE BASE (scripted, FANZON-trained)
-- =============================================
CREATE TABLE public.chatbot_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'general',
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatbot_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active FAQs" ON public.chatbot_faqs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage FAQs" ON public.chatbot_faqs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND email IN (
      SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ))
  );

-- Seed initial FANZON FAQs
INSERT INTO public.chatbot_faqs (category, question, answer, keywords) VALUES
('shipping', 'How long does delivery take?', 'FANZON delivers across Pakistan within 3-7 business days. Major cities like Karachi, Lahore, and Islamabad typically receive orders in 2-3 days.', ARRAY['delivery', 'shipping', 'time', 'days', 'kitne din', 'kab tak']),
('shipping', 'What are the shipping charges?', 'FANZON offers competitive shipping rates. Standard delivery charges vary by location. Free shipping is available on select orders above Rs. 2,000.', ARRAY['shipping', 'charges', 'cost', 'fee', 'delivery fee', 'kitna']),
('shipping', 'How can I track my order?', 'You can track your order from My Account > My Orders. Click on the order to see real-time tracking with courier name and tracking ID.', ARRAY['track', 'tracking', 'order status', 'kahan hai', 'where']),
('returns', 'What is the return policy?', 'FANZON offers easy returns within 7 days of delivery. Items must be unused and in original packaging. Go to My Orders > select order > Request Return.', ARRAY['return', 'exchange', 'refund', 'wapas', 'back']),
('returns', 'How do I get a refund?', 'Refunds are processed to your FANZON Wallet within 3-5 business days after return approval. You can use wallet balance for future purchases.', ARRAY['refund', 'money back', 'paise', 'wallet', 'credit']),
('payments', 'What payment methods are accepted?', 'FANZON accepts Cash on Delivery (COD), Bank Transfer, JazzCash, EasyPaisa, and wallet balance. Choose your preferred method at checkout.', ARRAY['payment', 'pay', 'cod', 'jazzcash', 'easypaisa', 'bank']),
('payments', 'Is Cash on Delivery available?', 'Yes! Cash on Delivery (COD) is available across Pakistan. Pay when your order arrives at your doorstep.', ARRAY['cod', 'cash', 'delivery', 'cash on delivery']),
('account', 'How do I create an account?', 'Click Sign Up on the FANZON homepage. Enter your name, email, and password. Verify your email and start shopping!', ARRAY['account', 'register', 'sign up', 'create', 'join']),
('account', 'How do I become a seller?', 'Join FANZON as a seller! Click "Become a Partner" and complete the KYC verification process including business details, CNIC, and bank information.', ARRAY['seller', 'sell', 'vendor', 'partner', 'shop', 'dukan']),
('account', 'How do I contact support?', 'You can chat with our support team right here! You can also reach us via WhatsApp or the Contact Us page on FANZON.', ARRAY['contact', 'support', 'help', 'customer service', 'rabta']),
('products', 'Are products on FANZON genuine?', 'FANZON verifies all sellers through a strict KYC process. Products are sourced from verified sellers. Check seller ratings and reviews before purchasing.', ARRAY['genuine', 'authentic', 'real', 'fake', 'original', 'asli']),
('products', 'How do I leave a review?', 'After your order is delivered, go to My Orders > select the delivered order > Write Review. Rate 1-5 stars and share your experience with photos.', ARRAY['review', 'rating', 'feedback', 'comment']),
('wallet', 'What is FANZON Wallet?', 'FANZON Wallet is your digital wallet on the platform. It holds refund credits and can be used for purchases. Deposit funds via bank transfer or mobile payments.', ARRAY['wallet', 'balance', 'deposit', 'funds']),
('vouchers', 'How do I use vouchers?', 'Collect vouchers from the Vouchers page or flash sales. Apply the voucher code at checkout to get discounts on your order.', ARRAY['voucher', 'coupon', 'discount', 'code', 'promo']),
('general', 'What is FANZON?', 'FANZON is Pakistan''s trusted online marketplace connecting buyers with verified sellers. Shop electronics, fashion, home goods and more with secure payments and fast delivery.', ARRAY['fanzon', 'about', 'what', 'kya hai']);

-- Enable realtime for chatbot (for admin management)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_faqs;

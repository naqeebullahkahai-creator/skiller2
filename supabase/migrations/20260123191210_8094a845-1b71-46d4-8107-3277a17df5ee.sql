-- Add seller and product scope to vouchers
ALTER TABLE public.vouchers 
ADD COLUMN seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
ADD COLUMN voucher_type text NOT NULL DEFAULT 'code' CHECK (voucher_type IN ('code', 'collectible')),
ADD COLUMN one_per_customer boolean NOT NULL DEFAULT false,
ADD COLUMN title text,
ADD COLUMN description text;

-- Create collected vouchers table for users who claimed collectible vouchers
CREATE TABLE public.collected_vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  collected_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  UNIQUE(user_id, voucher_id)
);

-- Enable RLS on collected_vouchers
ALTER TABLE public.collected_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collected_vouchers
CREATE POLICY "Users can view their own collected vouchers"
ON public.collected_vouchers FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can collect vouchers"
ON public.collected_vouchers FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collected vouchers"
ON public.collected_vouchers FOR UPDATE
USING (user_id = auth.uid());

-- Update vouchers RLS to allow sellers to manage their own vouchers
CREATE POLICY "Sellers can view their own vouchers"
ON public.vouchers FOR SELECT
USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can create their own vouchers"
ON public.vouchers FOR INSERT
WITH CHECK (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can update their own vouchers"
ON public.vouchers FOR UPDATE
USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can delete their own vouchers"
ON public.vouchers FOR DELETE
USING (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

-- Allow users to view collectible vouchers
CREATE POLICY "Anyone can view collectible vouchers"
ON public.vouchers FOR SELECT
USING (voucher_type = 'collectible' AND is_active = true AND expiry_date > now());

-- Create index for faster queries
CREATE INDEX idx_vouchers_seller ON public.vouchers(seller_id);
CREATE INDEX idx_vouchers_product ON public.vouchers(product_id);
CREATE INDEX idx_collected_vouchers_user ON public.collected_vouchers(user_id);
CREATE INDEX idx_collected_vouchers_voucher ON public.collected_vouchers(voucher_id);
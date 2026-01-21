-- Create flash sale nominations table for seller submissions
CREATE TABLE public.flash_sale_nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL,
  flash_sale_id UUID REFERENCES public.flash_sales(id) ON DELETE CASCADE,
  proposed_price_pkr NUMERIC NOT NULL,
  original_price_pkr NUMERIC NOT NULL,
  stock_limit INTEGER NOT NULL DEFAULT 50,
  time_slot_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_slot_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flash_sale_nominations ENABLE ROW LEVEL SECURITY;

-- Sellers can view and create their own nominations
CREATE POLICY "Sellers can view their own nominations"
ON public.flash_sale_nominations
FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can create their own nominations"
ON public.flash_sale_nominations
FOR INSERT
WITH CHECK (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can update their pending nominations"
ON public.flash_sale_nominations
FOR UPDATE
USING (seller_id = auth.uid() AND status = 'pending');

CREATE POLICY "Sellers can delete their pending nominations"
ON public.flash_sale_nominations
FOR DELETE
USING (seller_id = auth.uid() AND status = 'pending');

-- Admins can manage all nominations
CREATE POLICY "Admins can view all nominations"
ON public.flash_sale_nominations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update nominations"
ON public.flash_sale_nominations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to validate discount percentage (at least 20%)
CREATE OR REPLACE FUNCTION validate_flash_nomination_discount()
RETURNS TRIGGER AS $$
BEGIN
  IF ((NEW.original_price_pkr - NEW.proposed_price_pkr) / NEW.original_price_pkr * 100) < 20 THEN
    RAISE EXCEPTION 'Flash sale discount must be at least 20%%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_flash_nomination_discount
BEFORE INSERT OR UPDATE ON public.flash_sale_nominations
FOR EACH ROW
EXECUTE FUNCTION validate_flash_nomination_discount();

-- Add trigger for updated_at
CREATE TRIGGER update_flash_sale_nominations_updated_at
BEFORE UPDATE ON public.flash_sale_nominations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
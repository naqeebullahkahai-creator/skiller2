-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  variant_value TEXT NOT NULL,
  additional_price_pkr DECIMAL NOT NULL DEFAULT 0,
  stock_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can view variants for active products
CREATE POLICY "Anyone can view variants for active products"
  ON public.product_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'active'
    )
  );

-- Admins can view all variants
CREATE POLICY "Admins can view all variants"
  ON public.product_variants
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Sellers can manage their own product variants
CREATE POLICY "Sellers can insert their own variants"
  ON public.product_variants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.seller_id = auth.uid()
    )
    AND has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Sellers can update their own variants"
  ON public.product_variants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.seller_id = auth.uid()
    )
    AND has_role(auth.uid(), 'seller')
  );

CREATE POLICY "Sellers can delete their own variants"
  ON public.product_variants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.seller_id = auth.uid()
    )
    AND has_role(auth.uid(), 'seller')
  );

-- Sellers can view their own variants
CREATE POLICY "Sellers can view their own variants"
  ON public.product_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to decrease variant stock
CREATE OR REPLACE FUNCTION public.decrease_variant_stock(p_variant_id uuid, p_quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_count INTO current_stock
  FROM public.product_variants
  WHERE id = p_variant_id;
  
  IF current_stock IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.product_variants
  SET stock_count = stock_count - p_quantity, updated_at = now()
  WHERE id = p_variant_id;
  
  RETURN TRUE;
END;
$$;
-- Add display_id columns for unique FZN IDs
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_id TEXT;

ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS display_id TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS display_id TEXT;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.set_profile_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-U' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger function for seller profiles
CREATE OR REPLACE FUNCTION public.set_seller_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-S' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger function for products
CREATE OR REPLACE FUNCTION public.set_product_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-P' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS set_profile_display_id_trigger ON public.profiles;
CREATE TRIGGER set_profile_display_id_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_display_id();

DROP TRIGGER IF EXISTS set_seller_display_id_trigger ON public.seller_profiles;
CREATE TRIGGER set_seller_display_id_trigger
BEFORE INSERT ON public.seller_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_seller_display_id();

DROP TRIGGER IF EXISTS set_product_display_id_trigger ON public.products;
CREATE TRIGGER set_product_display_id_trigger
BEFORE INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_product_display_id();

-- Create sequences for sequential ID generation
CREATE SEQUENCE IF NOT EXISTS orders_display_seq START WITH 1001;
CREATE SEQUENCE IF NOT EXISTS sellers_display_seq START WITH 2001;
CREATE SEQUENCE IF NOT EXISTS users_display_seq START WITH 3001;
CREATE SEQUENCE IF NOT EXISTS products_display_seq START WITH 4001;

-- Update order number generation to use sequential IDs
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'FZN-ORD-' || LPAD(nextval('orders_display_seq')::TEXT, 5, '0');
END;
$function$;

-- Update seller display ID generation to use sequential IDs
CREATE OR REPLACE FUNCTION public.set_seller_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-SEL-' || LPAD(nextval('sellers_display_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Update profile display ID generation to use sequential IDs
CREATE OR REPLACE FUNCTION public.set_profile_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-USR-' || LPAD(nextval('users_display_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Update product display ID generation to use sequential IDs
CREATE OR REPLACE FUNCTION public.set_product_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-P-' || LPAD(nextval('products_display_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Sync sequences with existing data to avoid conflicts
DO $$
DECLARE
  max_order_num INTEGER;
  max_seller_num INTEGER;
  max_user_num INTEGER;
  max_product_num INTEGER;
BEGIN
  -- Get max order number
  SELECT COALESCE(MAX(NULLIF(regexp_replace(order_number, '[^0-9]', '', 'g'), '')::INTEGER), 1000) 
  INTO max_order_num FROM orders WHERE order_number IS NOT NULL;
  PERFORM setval('orders_display_seq', GREATEST(max_order_num + 1, 1001), false);
  
  -- Get max seller display ID
  SELECT COALESCE(MAX(NULLIF(regexp_replace(display_id, '[^0-9]', '', 'g'), '')::INTEGER), 2000) 
  INTO max_seller_num FROM seller_profiles WHERE display_id IS NOT NULL;
  PERFORM setval('sellers_display_seq', GREATEST(max_seller_num + 1, 2001), false);
  
  -- Get max user display ID
  SELECT COALESCE(MAX(NULLIF(regexp_replace(display_id, '[^0-9]', '', 'g'), '')::INTEGER), 3000) 
  INTO max_user_num FROM profiles WHERE display_id IS NOT NULL;
  PERFORM setval('users_display_seq', GREATEST(max_user_num + 1, 3001), false);
  
  -- Get max product display ID
  SELECT COALESCE(MAX(NULLIF(regexp_replace(display_id, '[^0-9]', '', 'g'), '')::INTEGER), 4000) 
  INTO max_product_num FROM products WHERE display_id IS NOT NULL;
  PERFORM setval('products_display_seq', GREATEST(max_product_num + 1, 4001), false);
END $$;

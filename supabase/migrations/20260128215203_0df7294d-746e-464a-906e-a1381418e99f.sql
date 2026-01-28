-- Update order number generation function to use new format FZN-ORD-XXXXX
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  order_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO order_count FROM public.orders;
  RETURN 'FZN-ORD-' || LPAD(order_count::TEXT, 5, '0');
END;
$function$;

-- Update user profile display ID function to use new format FZN-USR-XXXXXX
CREATE OR REPLACE FUNCTION public.set_profile_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-USR-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- Update seller display ID function to use new format FZN-SEL-XXXXXX
CREATE OR REPLACE FUNCTION public.set_seller_display_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'FZN-SEL-' || LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;
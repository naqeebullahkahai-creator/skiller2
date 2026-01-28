
-- Add shipped_at timestamp to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- Create function to auto-set shipped_at when status changes to shipped
CREATE OR REPLACE FUNCTION public.set_shipped_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.order_status = 'shipped' AND (OLD.order_status IS DISTINCT FROM 'shipped') THEN
    NEW.shipped_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-setting shipped_at
DROP TRIGGER IF EXISTS trigger_set_shipped_timestamp ON public.orders;
CREATE TRIGGER trigger_set_shipped_timestamp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_shipped_timestamp();

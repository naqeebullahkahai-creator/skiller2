-- Add tracking information columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS courier_name TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.tracking_id IS 'Courier tracking ID provided by seller when order is shipped';
COMMENT ON COLUMN public.orders.courier_name IS 'Name of courier service (e.g., TCS, Leopards, TEZZ)';
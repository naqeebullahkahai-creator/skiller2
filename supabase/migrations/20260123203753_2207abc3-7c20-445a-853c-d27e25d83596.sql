-- Add label field to user_addresses for address type (Home, Office, Other)
ALTER TABLE public.user_addresses ADD COLUMN IF NOT EXISTS label text DEFAULT 'Home';

-- Add delivery_instructions field to orders for special delivery notes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_instructions text;
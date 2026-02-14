
-- Add free_shipping and location columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS location text DEFAULT null;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count integer NOT NULL DEFAULT 0;

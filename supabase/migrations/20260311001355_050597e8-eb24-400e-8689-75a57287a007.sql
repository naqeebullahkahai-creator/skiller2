
-- Fix 1: Add 'confirmed' to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'confirmed' AFTER 'pending';

-- Fix 2: Add delivery boy fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_boy_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_boy_phone TEXT;

-- Fix RLS policies for products table - only recreate policies, don't touch functions
-- The has_role function already exists and works correctly

-- Recreate seller INSERT policy with explicit seller_id check
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
CREATE POLICY "Sellers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id 
  AND has_role(auth.uid(), 'seller'::app_role)
);

-- Recreate seller UPDATE policy with WITH CHECK
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
USING (
  seller_id = auth.uid() 
  AND has_role(auth.uid(), 'seller'::app_role)
)
WITH CHECK (
  seller_id = auth.uid() 
  AND has_role(auth.uid(), 'seller'::app_role)
);

-- Fix product_variants INSERT policy
DROP POLICY IF EXISTS "Sellers can insert their own variants" ON public.product_variants;
CREATE POLICY "Sellers can insert their own variants"
ON public.product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.seller_id = auth.uid()
  )
  AND has_role(auth.uid(), 'seller'::app_role)
);
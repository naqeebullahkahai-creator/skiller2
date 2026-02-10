
-- Create wishlist table for customers
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishlist
CREATE POLICY "Users can view own wishlist"
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to own wishlist
CREATE POLICY "Users can add to own wishlist"
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove from own wishlist
CREATE POLICY "Users can delete from own wishlist"
ON public.wishlists FOR DELETE
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

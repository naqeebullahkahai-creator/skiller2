-- Add columns for review images, seller replies, and moderation
ALTER TABLE public.product_reviews 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seller_reply text,
ADD COLUMN IF NOT EXISTS seller_replied_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hidden_by uuid,
ADD COLUMN IF NOT EXISTS hidden_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS hidden_reason text;

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review images
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update RLS policy for sellers to reply to reviews on their products
CREATE POLICY "Sellers can update reviews for their products"
ON public.product_reviews
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_reviews.product_id 
    AND p.seller_id = auth.uid()
  )
  AND has_role(auth.uid(), 'seller')
);

-- Admin can hide reviews
CREATE POLICY "Admins can update any review"
ON public.product_reviews
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));
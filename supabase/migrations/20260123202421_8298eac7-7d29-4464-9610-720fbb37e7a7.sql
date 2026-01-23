-- Add variant-specific images and video support to product_variants table
ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Add video support to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url text DEFAULT NULL;

-- Create index for faster variant image lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- Add comment for documentation
COMMENT ON COLUMN public.product_variants.image_urls IS 'Array of image URLs specific to this variant (e.g., images for Red color)';
COMMENT ON COLUMN public.products.video_url IS 'YouTube, TikTok, or direct video URL (max 15 seconds) for product showcase';
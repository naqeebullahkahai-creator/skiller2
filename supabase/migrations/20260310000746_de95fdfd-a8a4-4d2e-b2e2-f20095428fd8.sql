
-- Create seller_followers table
CREATE TABLE public.seller_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  follower_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seller_id, follower_id)
);

-- Enable RLS
ALTER TABLE public.seller_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view follower counts
CREATE POLICY "Anyone can view followers"
  ON public.seller_followers FOR SELECT
  USING (true);

-- Authenticated users can follow
CREATE POLICY "Authenticated users can follow"
  ON public.seller_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.seller_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Add store_logo_url and store_banner_url to seller_profiles if not exists
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS store_logo_url TEXT;
ALTER TABLE public.seller_profiles ADD COLUMN IF NOT EXISTS store_banner_url TEXT;

-- Enable realtime for seller_followers
ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_followers;

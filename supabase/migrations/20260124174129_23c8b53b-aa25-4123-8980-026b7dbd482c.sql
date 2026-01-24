-- Add selfie_url column to seller_profiles
ALTER TABLE public.seller_profiles 
ADD COLUMN IF NOT EXISTS selfie_url text;

-- Create site_settings table for Social Media CMS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  is_enabled boolean NOT NULL DEFAULT true,
  setting_type text NOT NULL DEFAULT 'text',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admin can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_super_admin(auth.uid()));

-- Insert default social media and contact settings
INSERT INTO public.site_settings (setting_key, setting_value, is_enabled, setting_type, description) VALUES
('social_facebook', 'https://facebook.com/fanzon', true, 'url', 'Facebook page URL'),
('social_instagram', 'https://instagram.com/fanzon', true, 'url', 'Instagram page URL'),
('social_twitter', 'https://twitter.com/fanzon', true, 'url', 'Twitter/X page URL'),
('social_youtube', 'https://youtube.com/@fanzon', true, 'url', 'YouTube channel URL'),
('social_tiktok', 'https://tiktok.com/@fanzon', false, 'url', 'TikTok page URL'),
('social_whatsapp', '+923001234567', true, 'phone', 'WhatsApp contact number'),
('contact_phone', '+92 42 1234 5678', true, 'phone', 'Official phone number'),
('contact_email', 'support@fanzon.pk', true, 'email', 'Official email address'),
('contact_address', 'Tower A, FANZON HQ, Lahore, Pakistan', true, 'text', 'Office address')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_site_settings_updated_at();

-- Create verification status enum
CREATE TYPE public.seller_verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create seller_profiles table
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  shop_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  cnic_number TEXT NOT NULL,
  cnic_front_url TEXT,
  cnic_back_url TEXT,
  bank_name TEXT NOT NULL,
  account_title TEXT NOT NULL,
  iban TEXT NOT NULL,
  bank_cheque_url TEXT,
  verification_status public.seller_verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_profiles
CREATE POLICY "Sellers can view their own profile"
ON public.seller_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Sellers can insert their own profile"
ON public.seller_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Sellers can update their own profile"
ON public.seller_profiles
FOR UPDATE
USING (user_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

CREATE POLICY "Admins can view all seller profiles"
ON public.seller_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all seller profiles"
ON public.seller_profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_seller_profiles_updated_at
BEFORE UPDATE ON public.seller_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for seller documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-docs', 'seller-docs', false);

-- Storage policies for seller-docs bucket
CREATE POLICY "Sellers can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'seller-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND has_role(auth.uid(), 'seller'::app_role)
);

CREATE POLICY "Sellers can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'seller-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'seller-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'seller-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all seller documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'seller-docs' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Function to check if seller is verified
CREATE OR REPLACE FUNCTION public.is_seller_verified(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.seller_profiles
    WHERE user_id = _user_id
      AND verification_status = 'verified'
  )
$$;

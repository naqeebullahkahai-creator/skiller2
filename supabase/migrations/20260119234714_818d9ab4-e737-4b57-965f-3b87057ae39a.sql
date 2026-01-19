
-- Add new columns to seller_profiles table
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS father_husband_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS cnic_issue_date DATE,
ADD COLUMN IF NOT EXISTS cnic_expiry_date DATE,
ADD COLUMN IF NOT EXISTS ntn_number TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Update the table to make new fields required for future entries
COMMENT ON COLUMN public.seller_profiles.father_husband_name IS 'Father/Husband name as per CNIC';
COMMENT ON COLUMN public.seller_profiles.gender IS 'Male, Female, or Other';
COMMENT ON COLUMN public.seller_profiles.date_of_birth IS 'Date of birth for age verification (18+)';
COMMENT ON COLUMN public.seller_profiles.cnic_issue_date IS 'CNIC issue date';
COMMENT ON COLUMN public.seller_profiles.cnic_expiry_date IS 'Auto-calculated: Issue date + 10 years';
COMMENT ON COLUMN public.seller_profiles.ntn_number IS 'National Tax Number';
COMMENT ON COLUMN public.seller_profiles.emergency_contact_name IS 'Emergency contact person name';
COMMENT ON COLUMN public.seller_profiles.emergency_contact_phone IS 'Emergency contact phone number';

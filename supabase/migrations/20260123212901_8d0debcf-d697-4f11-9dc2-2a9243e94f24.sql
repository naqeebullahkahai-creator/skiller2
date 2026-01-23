-- Add receipt_url column to payout_requests for storing payment proof
ALTER TABLE public.payout_requests 
ADD COLUMN IF NOT EXISTS receipt_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.payout_requests.receipt_url IS 'URL to payment receipt/screenshot uploaded by admin';
-- Create bulk_upload_logs table for admin monitoring
CREATE TABLE public.bulk_upload_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bulk_upload_logs ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own upload logs
CREATE POLICY "Sellers can view their own upload logs"
ON public.bulk_upload_logs
FOR SELECT
USING (seller_id = auth.uid());

-- Sellers can create their own upload logs
CREATE POLICY "Sellers can insert their own upload logs"
ON public.bulk_upload_logs
FOR INSERT
WITH CHECK (seller_id = auth.uid() AND has_role(auth.uid(), 'seller'::app_role));

-- Sellers can update their own upload logs
CREATE POLICY "Sellers can update their own upload logs"
ON public.bulk_upload_logs
FOR UPDATE
USING (seller_id = auth.uid());

-- Admins can view all upload logs
CREATE POLICY "Admins can view all upload logs"
ON public.bulk_upload_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_bulk_upload_logs_seller ON public.bulk_upload_logs(seller_id);
CREATE INDEX idx_bulk_upload_logs_created ON public.bulk_upload_logs(created_at DESC);
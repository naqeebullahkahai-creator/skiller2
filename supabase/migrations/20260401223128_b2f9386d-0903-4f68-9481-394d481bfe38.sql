
-- Create QR login sessions table
CREATE TABLE public.qr_login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qr_login_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can read sessions (needed for polling by token)
CREATE POLICY "Anyone can read qr sessions by token"
ON public.qr_login_sessions
FOR SELECT
USING (true);

-- Authenticated users can update (confirm) sessions
CREATE POLICY "Authenticated users can confirm qr sessions"
ON public.qr_login_sessions
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Allow inserts from edge functions (service role)
CREATE POLICY "Service role can insert qr sessions"
ON public.qr_login_sessions
FOR INSERT
WITH CHECK (true);

-- Enable realtime for polling
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_login_sessions;

-- Auto-update timestamp
CREATE TRIGGER update_qr_login_sessions_updated_at
BEFORE UPDATE ON public.qr_login_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

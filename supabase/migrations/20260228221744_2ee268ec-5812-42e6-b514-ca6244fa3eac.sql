
-- Create login_sessions table for tracking all login activity
CREATE TABLE public.login_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'customer',
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT, -- mobile / desktop / tablet
  device_name TEXT,
  browser_name TEXT,
  os_name TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  session_duration_minutes NUMERIC,
  login_status TEXT NOT NULL DEFAULT 'success', -- success / failed
  is_suspicious BOOLEAN DEFAULT false,
  suspicious_reason TEXT,
  is_new_device BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins (super admin) can view login sessions
CREATE POLICY "Super admins can view all login sessions"
ON public.login_sessions
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Only admins can delete login sessions
CREATE POLICY "Super admins can delete login sessions"
ON public.login_sessions
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Allow authenticated users to insert their own login session
CREATE POLICY "Users can insert their own login session"
ON public.login_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own session (for logout tracking)
CREATE POLICY "Users can update their own login session"
ON public.login_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_login_sessions_user_id ON public.login_sessions(user_id);
CREATE INDEX idx_login_sessions_login_at ON public.login_sessions(login_at DESC);
CREATE INDEX idx_login_sessions_ip ON public.login_sessions(ip_address);
CREATE INDEX idx_login_sessions_status ON public.login_sessions(login_status);
CREATE INDEX idx_login_sessions_suspicious ON public.login_sessions(is_suspicious) WHERE is_suspicious = true;

-- Create blocked_ips table
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  blocked_by UUID REFERENCES auth.users(id),
  reason TEXT,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage blocked IPs"
ON public.blocked_ips
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

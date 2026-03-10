
-- 1. Auto-expire old waiting sessions (older than 24 hours) by marking them as 'expired'
-- We'll handle this via filtering in the app, but also create a cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_waiting_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE support_chat_sessions
  SET status = 'expired', ended_at = now()
  WHERE status = 'waiting'
    AND created_at < now() - INTERVAL '24 hours';
END;
$$;

-- 2. Auto-end session when user closes chat without connection (via app-side, but also add policy)
-- Allow users to update their own waiting sessions to 'ended'
CREATE POLICY "Users can cancel their own waiting sessions"
ON public.support_chat_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'waiting')
WITH CHECK (user_id = auth.uid() AND status IN ('ended', 'expired'));

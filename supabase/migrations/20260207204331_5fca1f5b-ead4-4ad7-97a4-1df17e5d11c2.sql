
-- Agent performance table to track support agent metrics
CREATE TABLE public.agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  session_duration_minutes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;

-- Admins can view all performance records
CREATE POLICY "Admins can view agent performance"
  ON public.agent_performance FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- System inserts via trigger
CREATE POLICY "System can insert agent performance"
  ON public.agent_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Agents can view their own performance
CREATE POLICY "Agents view own performance"
  ON public.agent_performance FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

-- Add feedback_text column to support_chat_sessions if not exists
ALTER TABLE public.support_chat_sessions ADD COLUMN IF NOT EXISTS feedback_text TEXT;

-- Create trigger to auto-populate agent_performance when a session ends with a rating
CREATE OR REPLACE FUNCTION public.log_agent_performance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'ended' AND NEW.rating IS NOT NULL AND NEW.agent_id IS NOT NULL THEN
    INSERT INTO public.agent_performance (agent_id, session_id, rating, feedback_text, session_duration_minutes)
    VALUES (
      NEW.agent_id,
      NEW.id,
      NEW.rating,
      NEW.feedback_text,
      EXTRACT(EPOCH FROM (COALESCE(NEW.ended_at, now())::timestamptz - COALESCE(NEW.started_at, NEW.created_at)::timestamptz)) / 60
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_agent_performance
  AFTER UPDATE ON public.support_chat_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'ended' AND NEW.rating IS NOT NULL)
  EXECUTE FUNCTION public.log_agent_performance();

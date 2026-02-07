
-- Track which support agents are currently online
CREATE TABLE public.agent_online_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_online_status ENABLE ROW LEVEL SECURITY;

-- Agents can manage their own status
CREATE POLICY "Agents can view all online statuses"
  ON public.agent_online_status FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Agents can update their own status"
  ON public.agent_online_status FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Agents can insert their own status"
  ON public.agent_online_status FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger to notify online agents when a new support session is created
CREATE OR REPLACE FUNCTION public.notify_online_agents_on_new_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_agent RECORD;
  v_user_name TEXT;
BEGIN
  -- Get the requesting user's name
  SELECT full_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;

  -- Notify all online support agents
  FOR v_agent IN
    SELECT aos.user_id
    FROM agent_online_status aos
    JOIN user_roles ur ON ur.user_id = aos.user_id
    WHERE aos.is_online = true
      AND ur.role = 'admin'
  LOOP
    INSERT INTO notifications (user_id, title, message, notification_type, link)
    VALUES (
      v_agent.user_id,
      '🆘 New Support Request',
      'User ' || COALESCE(v_user_name, 'Unknown') || ' needs help' || 
        CASE WHEN NEW.subject IS NOT NULL THEN ': ' || NEW.subject ELSE '' END,
      'system',
      '/admin/support-queue'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_agents_new_session
  AFTER INSERT ON public.support_chat_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'waiting')
  EXECUTE FUNCTION public.notify_online_agents_on_new_session();

-- Enable realtime for agent_online_status
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_online_status;

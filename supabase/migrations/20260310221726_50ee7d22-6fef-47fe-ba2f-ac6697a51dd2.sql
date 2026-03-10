
-- 1. Add RLS policy so support_agents can view waiting sessions
CREATE POLICY "Support agents can view waiting sessions"
ON public.support_chat_sessions
FOR SELECT
TO authenticated
USING (
  status = 'waiting' AND agent_id IS NULL AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'support_agent')
);

-- 2. Create trigger to notify agents when new session is created
CREATE TRIGGER on_new_support_session
  AFTER INSERT ON public.support_chat_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'waiting')
  EXECUTE FUNCTION notify_online_agents_on_new_session();

-- 3. Also allow support_agents to update waiting sessions (to claim them)
CREATE POLICY "Support agents can claim waiting sessions"
ON public.support_chat_sessions
FOR UPDATE
TO authenticated
USING (
  status = 'waiting' AND agent_id IS NULL AND 
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'support_agent')
);

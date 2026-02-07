
-- 1. Add 'support_agent' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_agent';

-- 2. Support Agent Online Status
CREATE TABLE public.support_agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  max_concurrent_chats INT NOT NULL DEFAULT 3,
  active_chats INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.support_agent_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own status"
  ON public.support_agent_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can update their own status"
  ON public.support_agent_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all agent statuses"
  ON public.support_agent_status FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can see online agents"
  ON public.support_agent_status FOR SELECT
  TO authenticated
  USING (is_online = true);

-- 3. Support Chat Sessions
CREATE TABLE public.support_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  subject TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  rating_comment TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.support_chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = agent_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create sessions"
  ON public.support_chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents and admins can update sessions"
  ON public.support_chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = agent_id OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. Support Chat Messages
CREATE TABLE public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view messages"
  ON public.support_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_chat_sessions s
      WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.agent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Session participants can send messages"
  ON public.support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_chat_sessions s
      WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.agent_id = auth.uid())
    )
  );

-- 5. Chat Shortcuts (Admin managed quick replies)
CREATE TABLE public.chat_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active shortcuts"
  ON public.chat_shortcuts FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage shortcuts"
  ON public.chat_shortcuts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed some default shortcuts
INSERT INTO public.chat_shortcuts (label, message, category, display_order) VALUES
  ('Account Issue', 'I need help with my account.', 'general', 1),
  ('Payment Pending', 'I have a pending payment issue.', 'payment', 2),
  ('Order Status', 'I want to check the status of my order.', 'orders', 3),
  ('Return Request', 'I would like to return a product.', 'returns', 4),
  ('Delivery Issue', 'I have an issue with my delivery.', 'delivery', 5),
  ('Product Inquiry', 'I have a question about a product.', 'products', 6);

-- 6. Site Content Manager (CMS)
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page, section_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active content"
  ON public.site_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default content blocks
INSERT INTO public.site_content (page, section_key, title, content) VALUES
  ('home', 'hero_title', 'Hero Title', 'Welcome to FANZON'),
  ('home', 'hero_subtitle', 'Hero Subtitle', 'Pakistan''s Premium Online Marketplace'),
  ('help', 'faq_intro', 'FAQ Introduction', 'Find answers to frequently asked questions about orders, payments, and more.'),
  ('policy', 'return_policy', 'Return Policy', 'We offer a 7-day easy return policy. Products must be unused and in original packaging.'),
  ('policy', 'privacy_policy', 'Privacy Policy', 'Your privacy is important to us. We collect and use your personal information only as described in this policy.'),
  ('policy', 'terms_of_service', 'Terms of Service', 'By using FANZON, you agree to these terms and conditions.');

-- Enable realtime for support chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_sessions;

-- Add 'support_agent' to permission_feature enum if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_feature') THEN
    BEGIN
      ALTER TYPE public.permission_feature ADD VALUE IF NOT EXISTS 'support';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Add push_subscriptions table for storing push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Create function to create order status notification
CREATE OR REPLACE FUNCTION public.create_order_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when order_status changes
  IF OLD.order_status IS DISTINCT FROM NEW.order_status THEN
    INSERT INTO public.notifications (user_id, title, message, notification_type, link)
    VALUES (
      NEW.customer_id,
      'Order Update: ' || UPPER(NEW.order_status::text),
      'Your order ' || COALESCE(NEW.order_number, NEW.id::text) || ' has been ' || NEW.order_status::text || '.',
      'order',
      '/account/orders/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.order_status IS DISTINCT FROM NEW.order_status)
  EXECUTE FUNCTION public.create_order_status_notification();

-- Create function to create chat message notification
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation RECORD;
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_product_title TEXT;
BEGIN
  -- Get conversation details
  SELECT c.*, p.title as product_title
  INTO v_conversation
  FROM public.conversations c
  LEFT JOIN public.products p ON p.id = c.product_id
  WHERE c.id = NEW.conversation_id;

  -- Determine recipient (opposite of sender)
  IF NEW.sender_id = v_conversation.customer_id THEN
    v_recipient_id := v_conversation.seller_id;
  ELSE
    v_recipient_id := v_conversation.customer_id;
  END IF;

  -- Get sender name
  SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, title, message, notification_type, link)
  VALUES (
    v_recipient_id,
    'New message from ' || COALESCE(v_sender_name, 'User'),
    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
    'order',
    '/account/messages'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Allow admins to insert notifications for any user (for global marketing)
CREATE POLICY "Admins can insert notifications for any user"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
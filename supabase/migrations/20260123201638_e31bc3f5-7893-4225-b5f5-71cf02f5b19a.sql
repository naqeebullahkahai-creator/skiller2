
-- Create cancellation_logs table for admin monitoring
CREATE TABLE public.cancellation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id),
  cancelled_by UUID NOT NULL,
  cancelled_by_role TEXT NOT NULL CHECK (cancelled_by_role IN ('customer', 'seller', 'admin')),
  reason TEXT NOT NULL,
  refund_amount NUMERIC DEFAULT 0,
  refund_processed BOOLEAN DEFAULT false,
  items_restocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cancellation fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.cancellation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cancellation_logs
CREATE POLICY "Admins can view all cancellation logs"
  ON public.cancellation_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sellers can view their cancellations"
  ON public.cancellation_logs FOR SELECT
  USING (
    has_role(auth.uid(), 'seller'::app_role) AND
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = cancellation_logs.order_id
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(o.items) item
        WHERE (item->>'seller_id')::uuid = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can view their own cancellations"
  ON public.cancellation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = cancellation_logs.order_id
      AND o.customer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert cancellation logs"
  ON public.cancellation_logs FOR INSERT
  WITH CHECK (true);

-- Function to restock product inventory
CREATE OR REPLACE FUNCTION public.restock_order_items(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order RECORD;
  v_item JSONB;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Loop through each item and restock
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items)
  LOOP
    UPDATE products
    SET stock_count = stock_count + COALESCE((v_item->>'quantity')::INTEGER, 1),
        updated_at = now()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Function to process order cancellation with refund
CREATE OR REPLACE FUNCTION public.cancel_order_with_refund(
  p_order_id UUID,
  p_cancelled_by UUID,
  p_cancelled_by_role TEXT,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order RECORD;
  v_refund_amount NUMERIC := 0;
  v_wallet_id UUID;
  v_result JSONB;
BEGIN
  -- Get order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;
  
  -- Check if order can be cancelled
  IF v_order.order_status NOT IN ('pending', 'processing') THEN
    IF v_order.order_status = 'shipped' THEN
      RETURN jsonb_build_object('success', false, 'message', 'This order is already with the courier and cannot be cancelled.');
    ELSIF v_order.order_status = 'delivered' THEN
      RETURN jsonb_build_object('success', false, 'message', 'This order has been delivered. Please use the returns process.');
    ELSIF v_order.order_status = 'cancelled' THEN
      RETURN jsonb_build_object('success', false, 'message', 'This order is already cancelled.');
    END IF;
  END IF;
  
  -- Check authorization
  IF p_cancelled_by_role = 'customer' AND v_order.customer_id != p_cancelled_by THEN
    RETURN jsonb_build_object('success', false, 'message', 'You can only cancel your own orders');
  END IF;
  
  -- Update order status
  UPDATE orders
  SET order_status = 'cancelled',
      cancellation_reason = p_reason,
      cancelled_by = p_cancelled_by,
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_order_id;
  
  -- Restock items
  PERFORM restock_order_items(p_order_id);
  
  -- Process refund if prepaid
  IF v_order.payment_status = 'paid' THEN
    v_refund_amount := v_order.total_amount_pkr;
    
    -- Get or create customer wallet
    SELECT id INTO v_wallet_id FROM customer_wallets WHERE customer_id = v_order.customer_id;
    
    IF v_wallet_id IS NULL THEN
      INSERT INTO customer_wallets (customer_id, balance)
      VALUES (v_order.customer_id, 0)
      RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Credit refund to wallet
    INSERT INTO customer_wallet_transactions (
      wallet_id, customer_id, transaction_type, amount,
      order_id, description
    ) VALUES (
      v_wallet_id, v_order.customer_id, 'refund', v_refund_amount,
      p_order_id, 'Order cancellation refund - ' || COALESCE(v_order.order_number, p_order_id::TEXT)
    );
    
    -- Update wallet balance
    UPDATE customer_wallets
    SET balance = balance + v_refund_amount,
        total_refunds = total_refunds + v_refund_amount,
        updated_at = now()
    WHERE id = v_wallet_id;
    
    -- Log financial transaction
    INSERT INTO financial_logs (
      log_type, order_id, customer_id, amount_pkr, net_amount_pkr,
      description, metadata
    ) VALUES (
      'cancellation_refund', p_order_id, v_order.customer_id, v_refund_amount, v_refund_amount,
      'Order cancellation refund',
      jsonb_build_object('cancelled_by', p_cancelled_by, 'cancelled_by_role', p_cancelled_by_role, 'reason', p_reason)
    );
  END IF;
  
  -- Log the cancellation
  INSERT INTO cancellation_logs (
    order_id, cancelled_by, cancelled_by_role, reason,
    refund_amount, refund_processed, items_restocked
  ) VALUES (
    p_order_id, p_cancelled_by, p_cancelled_by_role, p_reason,
    v_refund_amount, (v_refund_amount > 0), true
  );
  
  -- Create notification for customer
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (
    v_order.customer_id,
    CASE 
      WHEN v_refund_amount > 0 THEN 'Order Cancelled - Refund Processed'
      ELSE 'Order Cancelled'
    END,
    CASE 
      WHEN v_refund_amount > 0 THEN 'Your order ' || COALESCE(v_order.order_number, '') || ' has been cancelled. Rs. ' || v_refund_amount || ' has been credited to your FANZON Wallet.'
      ELSE 'Your order ' || COALESCE(v_order.order_number, '') || ' has been cancelled. Reason: ' || p_reason
    END,
    'order',
    '/my-orders'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Order cancelled successfully',
    'refund_amount', v_refund_amount,
    'refund_processed', (v_refund_amount > 0)
  );
END;
$$;

-- Enable realtime for cancellation_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.cancellation_logs;

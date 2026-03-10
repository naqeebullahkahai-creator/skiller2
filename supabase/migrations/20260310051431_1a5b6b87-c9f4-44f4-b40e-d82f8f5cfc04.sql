
-- Order Settlements table for pending commission management
CREATE TABLE IF NOT EXISTS public.order_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seller_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id),
  product_title text,
  order_amount numeric NOT NULL DEFAULT 0,
  commission_type text NOT NULL DEFAULT 'percentage',
  commission_value numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  seller_payout numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  settled_at timestamptz,
  settled_by uuid,
  tracking_id text,
  courier_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settlements" ON public.order_settlements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sellers can view own settlements" ON public.order_settlements
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_settlements;

-- Trigger: auto-create settlement when order is delivered
CREATE OR REPLACE FUNCTION public.auto_create_settlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_product record;
  v_pc record;
  v_commission numeric;
  v_seller_id uuid;
  v_sale_amount numeric;
BEGIN
  IF NEW.order_status = 'delivered' AND (OLD.order_status IS DISTINCT FROM 'delivered') THEN
    -- Loop items in the order
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      v_product_id := (v_item->>'product_id')::uuid;
      
      SELECT p.*, pc.commission_type, pc.commission_value
      INTO v_product
      FROM products p
      LEFT JOIN product_commissions pc ON pc.product_id = p.id
      WHERE p.id = v_product_id;
      
      IF v_product IS NULL THEN CONTINUE; END IF;
      
      v_seller_id := v_product.seller_id;
      v_sale_amount := COALESCE((v_item->>'price')::numeric, 0) * COALESCE((v_item->>'quantity')::integer, 1);
      
      -- Calculate commission
      IF v_product.commission_type IS NOT NULL THEN
        IF v_product.commission_type = 'percentage' THEN
          v_commission := ROUND(v_sale_amount * v_product.commission_value / 100, 2);
        ELSE
          v_commission := v_product.commission_value;
        END IF;
      ELSE
        v_commission := 0;
      END IF;
      
      -- Only create if seller product (not admin store)
      IF v_seller_id IS NOT NULL THEN
        INSERT INTO order_settlements (
          order_id, seller_id, product_id, product_title,
          order_amount, commission_type, commission_value,
          commission_amount, seller_payout, tracking_id, courier_name
        ) VALUES (
          NEW.id, v_seller_id, v_product_id, v_product.title,
          v_sale_amount,
          COALESCE(v_product.commission_type, 'percentage'),
          COALESCE(v_product.commission_value, 0),
          v_commission,
          v_sale_amount - v_commission,
          NEW.tracking_id, NEW.courier_name
        ) ON CONFLICT (order_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_settlement
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_settlement();

-- Function: Admin settles commission
CREATE OR REPLACE FUNCTION public.settle_order_commission(p_settlement_id uuid, p_admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_s record;
  v_wallet_id uuid;
  v_cw_id uuid;
BEGIN
  SELECT * INTO v_s FROM order_settlements WHERE id = p_settlement_id AND status = 'pending';
  IF v_s IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Settlement not found or already processed');
  END IF;
  
  -- 1. Add commission to commission_wallet
  SELECT id INTO v_cw_id FROM commission_wallet LIMIT 1;
  IF v_cw_id IS NULL THEN
    INSERT INTO commission_wallet (total_balance, total_earned) VALUES (v_s.commission_amount, v_s.commission_amount) RETURNING id INTO v_cw_id;
  ELSE
    UPDATE commission_wallet SET total_balance = total_balance + v_s.commission_amount, total_earned = total_earned + v_s.commission_amount, updated_at = now() WHERE id = v_cw_id;
  END IF;
  
  -- Record commission transaction
  INSERT INTO commission_transactions (product_id, order_id, seller_id, commission_type, commission_value, sale_amount, commission_amount, product_title)
  VALUES (v_s.product_id, v_s.order_id, v_s.seller_id, v_s.commission_type, v_s.commission_value, v_s.order_amount, v_s.commission_amount, v_s.product_title);
  
  -- 2. Pay seller (remaining amount to seller wallet)
  SELECT id INTO v_wallet_id FROM seller_wallets WHERE seller_id = v_s.seller_id;
  IF v_wallet_id IS NULL THEN
    INSERT INTO seller_wallets (seller_id, current_balance, total_earnings) VALUES (v_s.seller_id, v_s.seller_payout, v_s.seller_payout) RETURNING id INTO v_wallet_id;
  ELSE
    UPDATE seller_wallets SET current_balance = current_balance + v_s.seller_payout, total_earnings = total_earnings + v_s.seller_payout, updated_at = now() WHERE id = v_wallet_id;
  END IF;
  
  INSERT INTO wallet_transactions (wallet_id, seller_id, transaction_type, gross_amount, net_amount, description, order_id)
  VALUES (v_wallet_id, v_s.seller_id, 'earning', v_s.order_amount, v_s.seller_payout, 'Order settlement - Commission ' || v_s.commission_amount || ' deducted', v_s.order_id);
  
  -- 3. Mark settlement as done
  UPDATE order_settlements SET status = 'settled', settled_at = now(), settled_by = p_admin_id, updated_at = now() WHERE id = p_settlement_id;
  
  -- 4. Notify seller
  INSERT INTO notifications (user_id, title, message, notification_type, link)
  VALUES (v_s.seller_id, '💰 Payment Received!', 'Rs. ' || v_s.seller_payout || ' has been added to your wallet for order delivery. Commission Rs. ' || v_s.commission_amount || ' deducted.', 'wallet', '/seller-center/wallet');
  
  RETURN jsonb_build_object('success', true, 'message', 'Settlement completed', 'commission', v_s.commission_amount, 'seller_payout', v_s.seller_payout);
END;
$$;

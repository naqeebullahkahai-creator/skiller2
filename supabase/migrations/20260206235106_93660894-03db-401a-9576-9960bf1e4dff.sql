
-- Fix decimal precision on unscaled wallet columns
ALTER TABLE customer_wallets 
  ALTER COLUMN balance TYPE numeric(12,2),
  ALTER COLUMN total_refunds TYPE numeric(12,2),
  ALTER COLUMN total_spent TYPE numeric(12,2);

ALTER TABLE customer_wallet_transactions
  ALTER COLUMN amount TYPE numeric(12,2);

ALTER TABLE financial_logs
  ALTER COLUMN amount_pkr TYPE numeric(12,2),
  ALTER COLUMN commission_amount_pkr TYPE numeric(12,2),
  ALTER COLUMN net_amount_pkr TYPE numeric(12,2);

ALTER TABLE deposit_requests
  ALTER COLUMN amount TYPE numeric(12,2);

ALTER TABLE cancellation_logs
  ALTER COLUMN refund_amount TYPE numeric(12,2);

ALTER TABLE payout_requests
  ALTER COLUMN amount TYPE numeric(12,2);

-- Reset sequences to professional starting numbers
SELECT setval('orders_display_seq', 1001, false);
SELECT setval('products_display_seq', 4001, false);
SELECT setval('users_display_seq', 3001, false);
SELECT setval('sellers_display_seq', 2001, false);

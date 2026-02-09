-- Fix: Add 'deposit' to the transaction_type check constraint
ALTER TABLE customer_wallet_transactions DROP CONSTRAINT customer_wallet_transactions_transaction_type_check;
ALTER TABLE customer_wallet_transactions ADD CONSTRAINT customer_wallet_transactions_transaction_type_check 
  CHECK (transaction_type = ANY (ARRAY['refund'::text, 'payment'::text, 'adjustment'::text, 'deposit'::text]));

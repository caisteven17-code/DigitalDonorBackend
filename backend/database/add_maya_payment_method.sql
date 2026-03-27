-- Run this in Supabase SQL Editor to allow "maya" as a payment method.

ALTER TABLE public.hopecard_purchases
DROP CONSTRAINT IF EXISTS hopecard_purchases_payment_method_check;

ALTER TABLE public.hopecard_purchases
ADD CONSTRAINT hopecard_purchases_payment_method_check
CHECK (payment_method IN ('gcash', 'card', 'bank', 'maya'));

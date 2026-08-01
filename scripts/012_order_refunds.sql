-- ============================================================================
-- Refund tracking for cancelled orders. Extends payment_status with
-- REFUNDED (alongside the existing PENDING/PAID/FAILED), and records when
-- the refund was marked as issued.
-- ============================================================================
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));

alter table public.orders add column if not exists refund_issued_at timestamptz;

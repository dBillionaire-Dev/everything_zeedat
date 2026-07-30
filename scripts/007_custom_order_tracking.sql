-- ============================================================================
-- 1. Custom order requests never had a real reference column -- the
--    reference shown to customers (e.g. "CO-8F14E45F") was only ever
--    computed on the fly from the row's id. That made a secure, phone-gated
--    lookup-by-reference (like regular orders already have) awkward. This
--    adds a real column, backfills existing rows using the exact same
--    format they were already shown, and makes future inserts set it
--    directly (see the updated app/api/custom-orders/route.ts).
-- ============================================================================
alter table public.custom_order_requests add column if not exists reference text;

update public.custom_order_requests
set reference = 'CO-' || upper(substring(id::text from 1 for 8))
where reference is null;

alter table public.custom_order_requests alter column reference set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'custom_order_requests_reference_key'
  ) then
    alter table public.custom_order_requests add constraint custom_order_requests_reference_key unique (reference);
  end if;
end $$;

create index if not exists custom_order_requests_reference_idx on public.custom_order_requests (reference);

-- ============================================================================
-- 2. Expand the status lifecycle so a confirmed custom order can keep
--    moving through the same preparation/delivery stages regular orders
--    use, giving customers real stage-by-stage tracking instead of stopping
--    at "Confirmed".
-- ============================================================================
alter table public.custom_order_requests drop constraint if exists custom_order_requests_status_check;
alter table public.custom_order_requests add constraint custom_order_requests_status_check
  check (status in ('NEW', 'REVIEWED', 'QUOTED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DECLINED'));

-- ============================================================================
-- 3. Secure lookup for the public custom-order tracking page -- same
--    pattern as get_order_by_reference: requires the phone on file to
--    match, so a reference number alone can't expose someone else's
--    request details.
-- ============================================================================
create or replace function public.get_custom_order_by_reference(p_reference text, p_phone text)
returns table (
  id uuid,
  reference text,
  status text,
  customer_name text,
  occasion text,
  budget_range text,
  description text,
  preferred_delivery_date date,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.reference,
    c.status,
    c.customer_name,
    c.occasion,
    c.budget_range,
    c.description,
    c.preferred_delivery_date,
    c.created_at
  from public.custom_order_requests c
  where c.reference = p_reference
    and regexp_replace(c.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g');
$$;

grant execute on function public.get_custom_order_by_reference(text, text) to anon, authenticated;

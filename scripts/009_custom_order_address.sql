-- ============================================================================
-- Custom order requests never collected a delivery address. Adding it as
-- nullable (existing rows won't have a value), while the form now requires
-- it for new submissions going forward.
-- ============================================================================
alter table public.custom_order_requests add column if not exists delivery_address text;
alter table public.custom_order_requests add column if not exists city text;
alter table public.custom_order_requests add column if not exists state text;

-- ============================================================================
-- Update the tracking RPC to also return the delivery address, now that
-- it's collected.
-- ============================================================================
drop function if exists public.get_custom_order_by_reference(text, text);

create or replace function public.get_custom_order_by_reference(p_reference text, p_phone text)
returns table (
  id uuid,
  reference text,
  status text,
  customer_name text,
  occasion text,
  budget_range text,
  description text,
  delivery_address text,
  city text,
  state text,
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
    c.delivery_address,
    c.city,
    c.state,
    c.preferred_delivery_date,
    c.created_at
  from public.custom_order_requests c
  where c.reference = p_reference
    and regexp_replace(c.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g');
$$;

grant execute on function public.get_custom_order_by_reference(text, text) to anon, authenticated;

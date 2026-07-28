-- ============================================================================
-- 1. Order tracking now requires the phone number on the order to match,
--    not just the reference number. Closes the PII exposure where anyone
--    with just a reference (which appears in URLs, emails, etc.) could pull
--    up another customer's name, address, and phone number.
-- ============================================================================
create or replace function public.get_order_by_reference(p_reference text, p_phone text)
returns table (
  id uuid,
  reference text,
  status text,
  payment_status text,
  delivery_date date,
  created_at timestamptz,
  customer_name text,
  phone text,
  delivery_address text,
  city text,
  state text,
  subtotal integer,
  delivery_fee integer,
  total integer,
  items jsonb
)
language sql
security definer
set search_path = public
stable
as $$
  select
    o.id,
    o.reference,
    o.status,
    o.payment_status,
    o.delivery_date,
    o.created_at,
    o.customer_name,
    o.phone,
    o.delivery_address,
    o.city,
    o.state,
    o.subtotal,
    o.delivery_fee,
    o.total,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'name', oi.name_snapshot,
          'price', oi.unit_price_snapshot,
          'quantity', oi.quantity,
          'customization', oi.customization_details
        )
      ) filter (where oi.id is not null),
      '[]'::jsonb
    ) as items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where o.reference = p_reference
    -- Compare digits only, so "0813 128 8947", "+234 813...", "234-813..."
    -- etc. all match regardless of formatting differences.
    and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  group by o.id;
$$;

-- Drop the old single-argument version now that the two-argument one covers it
drop function if exists public.get_order_by_reference(text);

grant execute on function public.get_order_by_reference(text, text) to anon, authenticated;

-- ============================================================================
-- 2. Storage bucket for product photos, used by the admin product CMS.
--    Public read (needed for the storefront), admin-only write.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_admin" on storage.objects;
create policy "product_images_insert_admin" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_update_admin" on storage.objects;
create policy "product_images_update_admin" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

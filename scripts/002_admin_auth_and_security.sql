-- ============================================================================
-- Admin auth + RLS lockdown + storage bucket for custom order reference images
-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- 1. Admin allowlist table
-- Every row here is a person allowed into /admin. Add rows AFTER creating the
-- matching user in Supabase Auth (Dashboard > Authentication > Users > Add user).
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'staff' check (role in ('super_admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
  for select using (auth.uid() = id);

-- Helper: is the currently authenticated user an admin?
-- security definer lets this bypass RLS internally so it can check the table
-- without recursion, while still only ever answering for auth.uid().
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- ============================================================================
-- 2. Products — public can read, only admins can write
-- ============================================================================
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
  for select using (true);

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 3. Orders — anyone can place an order (guest checkout), only admins can
--    list/browse all orders or change status. Public order-tracking goes
--    through the get_order_by_reference() function below instead of a
--    broad SELECT policy, so a reference number can't be used to page
--    through every order in the table.
-- ============================================================================
alter table public.orders enable row level security;

drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public" on public.orders
  for insert with check (true);

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders
  for delete using (public.is_admin());

alter table public.order_items enable row level security;

drop policy if exists "order_items_insert_public" on public.order_items;
create policy "order_items_insert_public" on public.order_items
  for insert with check (true);

drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin" on public.order_items
  for select using (public.is_admin());

-- Secure lookup for the public /order-tracking/[reference] page.
-- Runs as security definer so it can read the orders table despite the
-- admin-only SELECT policy above, but only ever returns the single order
-- matching the exact reference passed in.
-- NOTE: this preserves the same fields the /order-tracking page already
-- displays today (name, phone, address, totals). That page has always been
-- reachable by reference number alone with no phone/identity check, so this
-- migration does not change that exposure — it only stops a reference number
-- from also being usable to list or browse OTHER customers' orders, which
-- was possible before via a broad SELECT policy. Worth a fast-follow: add a
-- phone confirmation step on /order-tracking before showing these details.
create or replace function public.get_order_by_reference(p_reference text)
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
  group by o.id;
$$;

grant execute on function public.get_order_by_reference(text) to anon, authenticated;

-- ============================================================================
-- 4. Custom order requests — anyone can submit, only admins can list/manage
-- ============================================================================
alter table public.custom_order_requests enable row level security;

drop policy if exists "custom_orders_insert_public" on public.custom_order_requests;
create policy "custom_orders_insert_public" on public.custom_order_requests
  for insert with check (true);

drop policy if exists "custom_orders_select_admin" on public.custom_order_requests;
create policy "custom_orders_select_admin" on public.custom_order_requests
  for select using (public.is_admin());

drop policy if exists "custom_orders_update_admin" on public.custom_order_requests;
create policy "custom_orders_update_admin" on public.custom_order_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 5. Storage bucket for custom-order reference images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('custom-order-references', 'custom-order-references', true)
on conflict (id) do nothing;

-- Anyone can upload a reference image when submitting a custom order form
drop policy if exists "reference_images_insert_public" on storage.objects;
create policy "reference_images_insert_public" on storage.objects
  for insert with check (bucket_id = 'custom-order-references');

-- Public read (bucket is public, but an explicit policy keeps intent clear)
drop policy if exists "reference_images_select_public" on storage.objects;
create policy "reference_images_select_public" on storage.objects
  for select using (bucket_id = 'custom-order-references');

-- Only admins can delete uploaded images
drop policy if exists "reference_images_delete_admin" on storage.objects;
create policy "reference_images_delete_admin" on storage.objects
  for delete using (bucket_id = 'custom-order-references' and public.is_admin());

-- ============================================================================
-- 6. After running this file: create your admin user, then run this
--    (replace the email) to grant access:
--
--    insert into public.admin_users (id, email, role)
--    select id, email, 'super_admin'
--    from auth.users
--    where email = 'zeedat@example.com';
-- ============================================================================

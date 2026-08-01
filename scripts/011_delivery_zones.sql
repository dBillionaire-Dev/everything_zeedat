-- ============================================================================
-- Delivery fee becomes admin-configurable instead of a hardcoded flat rate.
-- A default fee (for any state not explicitly listed) lives on
-- site_settings, and specific states can be given their own fee via
-- delivery_zones -- letting the admin price delivery by distance/zone
-- without needing a real geocoding/distance-calculation integration.
-- ============================================================================
alter table public.site_settings add column if not exists default_delivery_fee integer not null default 2000;

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  state text not null unique,
  fee integer not null check (fee >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;

-- Public read -- checkout needs this to compute the delivery fee for
-- whatever state the customer enters.
drop policy if exists "delivery_zones_select_public" on public.delivery_zones;
create policy "delivery_zones_select_public" on public.delivery_zones
  for select using (true);

drop policy if exists "delivery_zones_write_admin" on public.delivery_zones;
create policy "delivery_zones_write_admin" on public.delivery_zones
  for all using (public.is_admin()) with check (public.is_admin());

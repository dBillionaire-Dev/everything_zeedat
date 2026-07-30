-- ============================================================================
-- Site-wide settings (currently just one flag). A single row, toggled from
-- the admin panel, that controls whether the public review-submission form
-- is open. Enforced at the RLS level below, not just hidden in the UI --
-- otherwise anyone with the anon key could still POST directly to Supabase
-- even while the button is hidden.
-- ============================================================================
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  reviews_submission_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (reviews_submission_enabled)
select false
where not exists (select 1 from public.site_settings);

-- ============================================================================
-- Customer reviews / star ratings.
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null, -- never shown publicly, admin-only visibility
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

-- Anyone can see visible reviews; an admin session sees everything
-- (including hidden ones), via the same query -- no separate admin-only
-- table or endpoint needed.
drop policy if exists "reviews_select_visible_or_admin" on public.reviews;
create policy "reviews_select_visible_or_admin" on public.reviews
  for select using (is_visible = true or public.is_admin());

-- Submitting a review is only allowed while the admin has the submission
-- flag turned on. This is the real gate -- the "Leave a Rating" button
-- being hidden in the UI is just a convenience on top of this.
drop policy if exists "reviews_insert_when_enabled" on public.reviews;
create policy "reviews_insert_when_enabled" on public.reviews
  for insert with check (
    exists (select 1 from public.site_settings where reviews_submission_enabled = true)
  );

-- Admins can hide/feature (the app layer only ever sends is_visible /
-- is_featured on update -- there's no edit-the-review-text UI at all).
drop policy if exists "reviews_update_admin" on public.reviews;
create policy "reviews_update_admin" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin" on public.reviews
  for delete using (public.is_admin());

-- ============================================================================
-- Rate limiting for public guest-write endpoints (checkout, custom orders).
-- Only ever accessed via the service-role client from server-side API
-- routes, so RLS is enabled with no policies -- anon/authenticated get
-- nothing, service role bypasses RLS entirely as usual.
-- ============================================================================
create table if not exists public.rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  rate_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_created_idx on public.rate_limit_hits (rate_key, created_at);

alter table public.rate_limit_hits enable row level security;
-- No policies -- deliberately unreachable except via the service-role client.

-- ============================================================================
-- Core schema: products, orders, order_items, custom_order_requests
-- Run this BEFORE 002_admin_auth_and_security.sql.
-- Field names/types below match exactly what lib/api.ts and the API routes
-- already expect — nothing in the app code needs to change.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- Products
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0), -- whole Naira, e.g. 15000 = ₦15,000
  category text not null check (category in ('hampers', 'gift-boxes', 'occasion-gifts', 'accessories')),
  occasion_tags text[] not null default '{}',
  images text[] not null default '{}',
  is_customizable boolean not null default false,
  customization_options jsonb not null default '{}'::jsonb,
  stock_status text not null default 'in-stock' check (stock_status in ('in-stock', 'low-stock', 'out-of-stock')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_is_featured_idx on public.products (is_featured);

-- ============================================================================
-- Orders
-- ============================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  delivery_address text not null,
  city text not null,
  state text not null,
  delivery_date date not null,
  notes text,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  status text not null default 'RECEIVED'
    check (status in ('RECEIVED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
  payment_status text not null default 'PENDING'
    check (payment_status in ('PENDING', 'PAID', 'FAILED')),
  payment_method text not null check (payment_method in ('PAYSTACK', 'WHATSAPP_MANUAL')),
  paystack_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_reference_idx on public.orders (reference);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ============================================================================
-- Order items
-- ============================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_snapshot text not null,
  unit_price_snapshot integer not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  customization_details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ============================================================================
-- Custom order requests
-- ============================================================================
create table if not exists public.custom_order_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  occasion text not null,
  budget_range text not null check (budget_range in ('under-10k', '10k-25k', '25k-50k', '50k-plus')),
  description text not null,
  reference_image_url text,
  preferred_delivery_date date,
  status text not null default 'NEW'
    check (status in ('NEW', 'REVIEWED', 'QUOTED', 'CONFIRMED', 'DECLINED')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_order_requests_status_idx on public.custom_order_requests (status);

-- ============================================================================
-- Seed: ~12 sample products so the storefront isn't empty on first load.
-- Safe to delete or edit these rows any time from /admin later.
-- ============================================================================
insert into public.products (name, slug, description, price, category, occasion_tags, images, is_customizable, is_featured, stock_status)
values
  ('Blush & Gold Hamper', 'blush-gold-hamper', 'A curated hamper of treats, candles, and a personalized note card.', 25000, 'hampers', array['birthday','anniversary'], array['/placeholder.svg'], true, true, 'in-stock'),
  ('Sweet Surprise Box', 'sweet-surprise-box', 'Chocolates, cookies, and a handwritten card in a keepsake box.', 15000, 'gift-boxes', array['just-because','birthday'], array['/placeholder.svg'], true, true, 'in-stock'),
  ('Anniversary Deluxe Hamper', 'anniversary-deluxe-hamper', 'Premium hamper with wine glasses, candles, and chocolates.', 45000, 'hampers', array['anniversary'], array['/placeholder.svg'], true, true, 'in-stock'),
  ('New Baby Gift Box', 'new-baby-gift-box', 'Soft baby essentials and a congratulations card, beautifully packaged.', 20000, 'gift-boxes', array['new-baby'], array['/placeholder.svg'], false, false, 'in-stock'),
  ('Corporate Appreciation Set', 'corporate-appreciation-set', 'A polished gift set for clients and team appreciation.', 30000, 'occasion-gifts', array['corporate'], array['/placeholder.svg'], true, false, 'in-stock'),
  ('Wedding Bliss Hamper', 'wedding-bliss-hamper', 'An elegant hamper for the newlyweds, with champagne flutes and treats.', 40000, 'hampers', array['wedding'], array['/placeholder.svg'], true, true, 'in-stock'),
  ('Personalized Mug & Tote Set', 'personalized-mug-tote-set', 'A custom-printed mug and tote bag combo, made to order.', 12000, 'accessories', array['just-because','birthday'], array['/placeholder.svg'], true, false, 'in-stock'),
  ('Self-Care Sunday Box', 'self-care-sunday-box', 'Candles, bath salts, and a journal for a relaxing day in.', 18000, 'gift-boxes', array['just-because'], array['/placeholder.svg'], false, false, 'in-stock'),
  ('Get Well Soon Basket', 'get-well-soon-basket', 'Comforting treats and a warm note to brighten someone''s recovery.', 14000, 'occasion-gifts', array['get-well'], array['/placeholder.svg'], false, false, 'low-stock'),
  ('Graduation Cheers Hamper', 'graduation-cheers-hamper', 'Celebrate their achievement with this festive hamper.', 22000, 'hampers', array['graduation'], array['/placeholder.svg'], true, false, 'in-stock'),
  ('Just Because Flower & Snack Box', 'just-because-flower-snack-box', 'A cheerful mix of snacks and a small floral arrangement.', 16000, 'gift-boxes', array['just-because'], array['/placeholder.svg'], false, true, 'in-stock'),
  ('Engraved Keepsake Box', 'engraved-keepsake-box', 'A wooden keepsake box with custom engraving of your choice.', 20000, 'accessories', array['anniversary','wedding'], array['/placeholder.svg'], true, false, 'in-stock')
on conflict (slug) do nothing;

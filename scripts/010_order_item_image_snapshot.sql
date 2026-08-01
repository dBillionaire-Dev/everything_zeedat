-- ============================================================================
-- Snapshot the product image at time of purchase, same idea as
-- name_snapshot/unit_price_snapshot -- so admin can see exactly what the
-- customer had in their cart, even if the product's photos change later
-- or the product is removed entirely.
-- ============================================================================
alter table public.order_items add column if not exists image_snapshot text;

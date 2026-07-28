-- Script 002 gave admins select/update on custom_order_requests but never
-- added a delete policy, since deletion wasn't a feature yet. Adding it now
-- so the admin console can remove custom order requests.
drop policy if exists "custom_orders_delete_admin" on public.custom_order_requests;
create policy "custom_orders_delete_admin" on public.custom_order_requests
  for delete using (public.is_admin());

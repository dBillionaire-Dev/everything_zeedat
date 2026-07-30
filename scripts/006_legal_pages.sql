-- ============================================================================
-- Legal pages (Privacy Policy, Terms of Service, Refund & Returns Policy)
-- editable from the admin panel instead of hardcoded in the site.
-- ============================================================================
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug in ('privacy', 'terms', 'refund-policy')),
  title text not null,
  -- Simple content format, not full HTML/markdown, so an admin can safely
  -- edit this from a plain textarea with no risk of breaking layout or
  -- injecting markup:
  --   lines starting with "## "  -> section heading
  --   lines starting with "- "   -> bullet list item (consecutive ones group into one list)
  --   blank-line-separated text  -> paragraphs
  content text not null,
  updated_at timestamptz not null default now()
);

alter table public.legal_pages enable row level security;

drop policy if exists "legal_pages_select_public" on public.legal_pages;
create policy "legal_pages_select_public" on public.legal_pages
  for select using (true);

drop policy if exists "legal_pages_update_admin" on public.legal_pages;
create policy "legal_pages_update_admin" on public.legal_pages
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Seed the three pages with the same starter-draft content that was
-- previously hardcoded into the site. Safe to re-run -- won't duplicate.
-- ============================================================================
insert into public.legal_pages (slug, title, content)
values (
  'privacy',
  'Privacy Policy',
  '## 1. Introduction
Gifts by EverythingZeedat ("we", "us", "our") respects your privacy. This policy explains what information we collect when you use this website, how we use it, and the choices you have.

## 2. Information We Collect
When you place an order or submit a custom gift request, we collect:
- Your name, phone number, and delivery address
- Your email address, if you choose to provide one
- Order details, items, customization choices, delivery date, and any notes
- Reference images you upload for a custom order request
- Payment status of your order (and, once online payment is available, payment records processed by our payment provider)

We do not require an account to shop with us. Your shopping cart and wishlist are stored only in your own browser (using local storage), not on our servers, and are never shared with anyone.

## 3. How We Use Your Information
- To process, prepare, and deliver your order
- To send you order confirmations and updates (if you provided an email)
- To respond to custom gift requests and coordinate details over WhatsApp or email
- To improve our products and service

## 4. Third-Party Services
We rely on a small number of trusted service providers to run this site:
- Supabase, our database and file storage provider, which securely holds order and product information
- Gmail / Google Workspace, used to send order confirmation and update emails
- Paystack, once online payment is enabled, will process card/bank payments directly; we do not store your card details ourselves

These providers only receive the information necessary to perform their function and are bound by their own privacy and security practices.

## 5. Data Retention
We keep order information for as long as reasonably necessary to fulfill your order, handle any follow-up questions or disputes, and meet our own recordkeeping obligations.

## 6. Your Rights
You can ask us to access, correct, or delete the personal information we hold about you at any time by reaching out via WhatsApp or through our Contact page.

## 7. Children''s Privacy
This site is not directed at children, and we do not knowingly collect information from minors.

## 8. Changes to This Policy
We may update this policy from time to time. Significant changes will be reflected by updating the date at the top of this page.'
)
on conflict (slug) do nothing;

insert into public.legal_pages (slug, title, content)
values (
  'terms',
  'Terms of Service',
  '## 1. About Us
Gifts by EverythingZeedat is a Nigerian gifting business offering hampers, gift boxes, occasion gifts, and made-to-order custom pieces. By using this website or placing an order with us, you agree to these terms.

## 2. Products & Pricing
All prices are listed in Nigerian Naira (₦) and are subject to change without notice. Custom order pricing is quoted individually based on the details you provide and is not final until confirmed.

## 3. Placing an Order
You can shop as a guest, no account is required. Submitting an order through this site is a request to purchase, not a final, binding sale. Your order is confirmed once we verify the details and payment with you directly, typically over WhatsApp.

## 4. Payment
At present, payment is coordinated and confirmed directly with our team via WhatsApp after you place an order online. Once online card/bank payment (via Paystack) becomes available, that option will be clearly shown at checkout.

## 5. Delivery
We deliver across Nigeria. Delivery dates provided at checkout are estimates, actual delivery may be affected by logistics, weather, or other circumstances outside our control. We''ll keep you informed of any changes.

## 6. Customization Requests
Customization options shown on a product page, and fully custom gift requests submitted separately, are subject to feasibility and any additional cost shown or quoted to you before your order is confirmed.

## 7. Cancellations
You may request a cancellation before your order enters preparation. Once preparation has begun, especially for custom or personalized items, cancellation may no longer be possible. See our Refund & Returns Policy for details.

## 8. Intellectual Property
All content on this site, including photos, product designs, and text, belongs to Gifts by EverythingZeedat and may not be reused without permission.

## 9. Limitation of Liability
We do our best to ensure every gift arrives as described and on time. To the extent permitted by law, we are not liable for indirect or consequential losses arising from delays or issues outside our reasonable control.

## 10. Governing Law
These terms are governed by the laws of the Federal Republic of Nigeria.

## 11. Changes to These Terms
We may update these terms occasionally. Continued use of the site after changes means you accept the updated terms.

## 12. Contact
Questions about these terms? Reach us on WhatsApp or through our Contact page.'
)
on conflict (slug) do nothing;

insert into public.legal_pages (slug, title, content)
values (
  'refund-policy',
  'Refund & Returns Policy',
  '## 1. Damaged or Incorrect Items
If your order arrives damaged, incorrect, or incomplete, please contact us within 48 hours of delivery with your order reference and photos of the item. We''ll work with you on a replacement, correction, or refund as appropriate.

## 2. Custom & Personalized Orders
Because custom and personalized gifts (engraved items, personalized messages, made-to-order hampers, etc.) are prepared specifically for you, they are not eligible for return or refund once preparation has begun, except in cases of a genuine error on our part.

## 3. General Merchandise Returns
Given the nature of gift items (many are perishable or delicate), we generally do not accept returns once an order has been delivered, other than for the damaged/incorrect-item cases above. If there''s a specific concern, reach out, we consider requests on a case-by-case basis.

## 4. Cancellations
Orders can be cancelled free of charge before payment is confirmed or preparation begins. Once confirmed and in preparation, cancellation may not be possible, particularly for custom orders.

## 5. How Refunds Are Issued
Approved refunds are returned via the original payment method where possible, or by bank transfer, and are typically processed within a few business days of approval.

## 6. Not Covered
- Change of mind after an order has been dispatched
- Delivery issues caused by an incorrect address provided by the customer
- Normal variation in handmade or naturally-varying items (e.g. fresh flowers, baked goods)

## 7. How to Request a Refund or Report an Issue
Message us on WhatsApp with your order reference number, a description of the issue, and photos if applicable.'
)
on conflict (slug) do nothing;

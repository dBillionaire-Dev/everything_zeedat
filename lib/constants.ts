// Delivery fee is no longer a flat constant -- it's admin-configurable via
// the site_settings.default_delivery_fee + delivery_zones table (see
// /admin/delivery-zones). Fetched at runtime in cart/checkout pages.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://everythingzeedat.vercel.app';

// Business contact details, used across WhatsApp deep links, email
// templates, and the footer/contact page. Update here once, everywhere
// picks it up -- previously this number was hardcoded separately in ~7
// different files.
export const WHATSAPP_NUMBER = '2348131288947'; // digits only, no +, for wa.me links
export const WHATSAPP_DISPLAY = '+234 813 128 8947';
export const INSTAGRAM_HANDLE = '@gifts.by.everythingzeedat';
export const INSTAGRAM_URL = 'https://instagram.com/gifts.by.everythingzeedat';

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Flat delivery fee applied at checkout. Kept in one place so cart and
// checkout can never show a different number from each other -- update
// here if pricing changes.
export const DELIVERY_FEE = 2000;

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

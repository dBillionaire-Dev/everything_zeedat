// No 'use client' here on purpose — this needs to be importable from both
// lib/api.ts (a client module, since it uses the browser Supabase client)
// and server-side API routes like app/api/orders/route.ts. A plain function
// with no browser-only APIs can safely live on either side of that boundary,
// but only if it isn't defined inside a file that's already marked 'use client'.
export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateCustomOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CO-${timestamp}-${random}`;
}

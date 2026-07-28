import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client for trusted, server-only database writes.
 *
 * Unlike lib/supabase/server.ts (which uses the anon key + the visitor's
 * cookie session, and is therefore subject to RLS), this client
 * authenticates as the service role and bypasses RLS entirely.
 *
 * Only use this for server-side code paths that have already validated
 * their own input (like the guest-checkout and custom-order API routes) —
 * never expose this client or the underlying key to the browser.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Get the service role key from Supabase Dashboard > Project Settings > API ' +
        '(the "service_role" secret key, NOT the anon/public one) and add it to .env.local.'
    )
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

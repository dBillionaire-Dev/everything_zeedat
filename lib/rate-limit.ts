import { createServiceRoleClient } from './supabase/service-role';

interface RateLimitOptions {
  /** Unique-ish identifier for who's being limited, e.g. `orders:1.2.3.4` */
  key: string;
  /** Max allowed hits within the window */
  limit: number;
  /** Window size in minutes */
  windowMinutes: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Checks (and records) a rate-limit hit for the given key. Call this once
 * per incoming request, before doing the actual work. Fails open (allows
 * the request) if the rate-limit table itself is unreachable -- a guest
 * checkout shouldn't break just because this secondary safeguard did.
 */
export async function checkRateLimit({ key, limit, windowMinutes }: RateLimitOptions): Promise<RateLimitResult> {
  try {
    const supabase = createServiceRoleClient();
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    // Opportunistic cleanup of this key's old hits -- keeps the table small
    // without needing a separate cron job.
    await supabase.from('rate_limit_hits').delete().eq('rate_key', key).lt('created_at', windowStart);

    const { count, error: countError } = await supabase
      .from('rate_limit_hits')
      .select('id', { count: 'exact', head: true })
      .eq('rate_key', key)
      .gte('created_at', windowStart);

    if (countError) throw countError;

    const currentCount = count ?? 0;

    if (currentCount >= limit) {
      return { allowed: false, remaining: 0 };
    }

    await supabase.from('rate_limit_hits').insert({ rate_key: key });

    return { allowed: true, remaining: limit - currentCount - 1 };
  } catch (error) {
    console.error('Rate limit check failed, allowing request through:', error);
    return { allowed: true, remaining: limit };
  }
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

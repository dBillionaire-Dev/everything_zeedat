import type { MetadataRoute } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { SITE_URL as siteUrl } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/custom-orders`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  try {
    // Read-only, public data with no auth context needed here -- the
    // service-role client is used purely because it doesn't depend on
    // cookies()/session plumbing, which keeps this special Next.js file
    // simple. (lib/api.ts is intentionally not imported here: it's a
    // 'use client' module for the browser, and this file runs server-side.)
    const supabase = createServiceRoleClient()
    const { data: products, error } = await supabase
      .from('products')
      .select('slug, updated_at')

    if (error) throw error

    const productPages: MetadataRoute.Sitemap = (products || []).map(product => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    return [...staticPages, ...productPages]
  } catch {
    // If Supabase isn't reachable at build/request time, still return the
    // static pages rather than failing the whole sitemap.
    return staticPages
  }
}

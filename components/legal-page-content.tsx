'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { LegalPage } from '@/lib/api'
import LegalPageLayout from './legal-page-layout'
import LegalContentRenderer from './legal-content-renderer'

export default function LegalPageContent({ slug }: { slug: LegalPage['slug'] }) {
  const [page, setPage] = useState<LegalPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.legalPages
      .getBySlug(slug)
      .then(setPage)
      .catch(err => {
        console.error('Error fetching legal page:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#8b8b8b]">Loading...</p>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <p className="text-[#8b8b8b]">
          This page couldn&apos;t be loaded right now. Please try again shortly, or reach out via our{' '}
          <a href="/contact" className="text-[#d4a5a5] hover:text-[#c4956f]">Contact page</a>.
        </p>
      </div>
    )
  }

  return (
    <LegalPageLayout
      title={page.title}
      lastUpdated={new Date(page.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    >
      <LegalContentRenderer content={page.content} />
    </LegalPageLayout>
  )
}

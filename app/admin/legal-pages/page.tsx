'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, CheckCircle, Info } from 'lucide-react'
import { api } from '@/lib/api'
import type { LegalPage } from '@/lib/api'
import LegalContentRenderer from '@/components/legal-content-renderer'

const PAGES: { slug: LegalPage['slug']; label: string }[] = [
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms of Service' },
  { slug: 'refund-policy', label: 'Refund & Returns' },
]

export default function AdminLegalPagesPage() {
  const [activeSlug, setActiveSlug] = useState<LegalPage['slug']>('privacy')
  const [pages, setPages] = useState<Record<string, LegalPage>>({})
  const [drafts, setDrafts] = useState<Record<string, { title: string; content: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadAll = async () => {
      try {
        const results = await Promise.all(PAGES.map(p => api.legalPages.getBySlug(p.slug)))
        const pagesMap: Record<string, LegalPage> = {}
        const draftsMap: Record<string, { title: string; content: string }> = {}
        results.forEach(page => {
          pagesMap[page.slug] = page
          draftsMap[page.slug] = { title: page.title, content: page.content }
        })
        setPages(pagesMap)
        setDrafts(draftsMap)
      } catch (error) {
        console.error('[v0] Error loading legal pages:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  const activeDraft = drafts[activeSlug]
  const activePage = pages[activeSlug]

  const handleSave = async () => {
    if (!activeDraft) return
    setSaving(true)
    setSavedSlug(null)
    try {
      const updated = await api.legalPages.update(activeSlug, activeDraft)
      setPages(prev => ({ ...prev, [activeSlug]: updated }))
      setSavedSlug(activeSlug)
      setTimeout(() => setSavedSlug(null), 3000)
    } catch (error) {
      console.error('[v0] Error saving legal page:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Legal Pages</h1>
          <div />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-[#8b8b8b]">Loading...</p>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#e8dfd9]">
              {PAGES.map(p => (
                <button
                  key={p.slug}
                  onClick={() => setActiveSlug(p.slug)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeSlug === p.slug
                      ? 'border-[#d4a5a5] text-[#d4a5a5]'
                      : 'border-transparent text-[#8b8b8b] hover:text-[#2a2a2a]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {activeDraft && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 bg-[#f9f7f4] border border-[#e8dfd9] rounded-lg p-3 text-xs text-[#8b8b8b]">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#d4a5a5]" />
                  <span>
                    Formatting: start a line with <code className="bg-white px-1 rounded">## </code> for a
                    section heading, <code className="bg-white px-1 rounded">- </code> for a bullet point, or
                    just leave a blank line between paragraphs. No other HTML or markdown is needed.
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Page Title</label>
                    <input
                      type="text"
                      value={activeDraft.title}
                      onChange={e =>
                        setDrafts(prev => ({ ...prev, [activeSlug]: { ...prev[activeSlug], title: e.target.value } }))
                      }
                      className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-[#2a2a2a]">Content</label>
                      <button
                        type="button"
                        onClick={() => setShowPreview(v => !v)}
                        className="text-xs text-[#d4a5a5] hover:text-[#c4956f] font-medium"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>
                    <textarea
                      value={activeDraft.content}
                      onChange={e =>
                        setDrafts(prev => ({ ...prev, [activeSlug]: { ...prev[activeSlug], content: e.target.value } }))
                      }
                      rows={20}
                      className="w-full px-4 py-3 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white font-mono text-sm resize-y"
                    />
                  </div>

                  {activePage && (
                    <p className="text-xs text-[#8b8b8b]">
                      Last saved: {new Date(activePage.updated_at).toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#d4a5a5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {savedSlug === activeSlug && (
                      <span className="flex items-center gap-1 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Saved
                      </span>
                    )}
                  </div>
                </div>

                {showPreview && (
                  <div className="bg-white rounded-xl border border-[#e8dfd9] p-6">
                    <p className="text-xs text-[#8b8b8b] uppercase mb-4">Preview</p>
                    <div className="text-[#2a2a2a] leading-relaxed">
                      <h2 className="text-2xl font-serif font-bold mb-4">{activeDraft.title}</h2>
                      <LegalContentRenderer content={activeDraft.content} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

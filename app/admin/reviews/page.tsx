'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Star, Trash2, Mail } from 'lucide-react'
import { api } from '@/lib/api'
import type { Review, SiteSettings } from '@/lib/api'
import { StarRatingDisplay } from '@/components/star-rating'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingSettings, setTogglingSettings] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [reviewsData, settingsData] = await Promise.all([
          api.reviews.list(),
          api.siteSettings.get(),
        ])
        setReviews(reviewsData)
        setSettings(settingsData)
      } catch (error) {
        console.error('Error loading reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggleSubmissions = async () => {
    if (!settings) return
    setTogglingSettings(true)
    try {
      const updated = await api.siteSettings.setReviewsSubmissionEnabled(
        settings.id,
        !settings.reviews_submission_enabled
      )
      setSettings(updated)
    } catch (error) {
      console.error('Error toggling review submissions:', error)
    } finally {
      setTogglingSettings(false)
    }
  }

  const handleToggleVisibility = async (review: Review) => {
    setBusyId(review.id)
    try {
      const updated = await api.reviews.setVisibility(review.id, !review.is_visible)
      setReviews(prev => prev.map(r => (r.id === review.id ? updated : r)))
    } catch (error) {
      console.error('Error toggling visibility:', error)
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleFeatured = async (review: Review) => {
    setBusyId(review.id)
    try {
      const updated = await api.reviews.setFeatured(review.id, !review.is_featured)
      setReviews(prev => prev.map(r => (r.id === review.id ? updated : r)))
    } catch (error) {
      console.error('Error toggling featured:', error)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    try {
      await api.reviews.remove(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setBusyId(null)
      setConfirmingDeleteId(null)
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
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Reviews & Ratings</h1>
          <div />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-[#8b8b8b]">Loading...</p>
        ) : (
          <>
            {/* Submission toggle */}
            {settings && (
              <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-semibold text-lg text-[#2a2a2a]">Accepting New Ratings</h2>
                  <p className="text-sm text-[#8b8b8b] mt-1">
                    When off, the &quot;Leave a Rating&quot; button is hidden and submissions are blocked
                    site-wide, not just hidden in the UI.
                  </p>
                </div>
                <button
                  onClick={handleToggleSubmissions}
                  disabled={togglingSettings}
                  className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                    settings.reviews_submission_enabled ? 'bg-[#d4a5a5]' : 'bg-[#e8dfd9]'
                  } disabled:opacity-50`}
                  aria-label="Toggle review submissions"
                >
                  <span
                    className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      settings.reviews_submission_enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#e8dfd9]">
                <p className="text-[#8b8b8b]">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div
                    key={review.id}
                    className={`bg-white rounded-xl border p-6 ${
                      review.is_visible ? 'border-[#e8dfd9]' : 'border-dashed border-[#e8dfd9] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <StarRatingDisplay rating={review.rating} />
                          {review.is_featured && (
                            <span className="text-xs font-medium bg-[#e8d4d4] text-[#2a2a2a] px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                          {!review.is_visible && (
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-[#2a2a2a] text-sm mb-3">&ldquo;{review.review_text}&rdquo;</p>
                        <div className="flex items-center gap-4 text-xs text-[#8b8b8b]">
                          <span className="font-medium text-[#2a2a2a]">{review.name}</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {review.email}
                          </span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleVisibility(review)}
                          disabled={busyId === review.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e8dfd9] text-[#2a2a2a] hover:bg-[#f9f7f4] transition-colors disabled:opacity-50"
                        >
                          {review.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {review.is_visible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(review)}
                          disabled={busyId === review.id}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#e8dfd9] text-[#2a2a2a] hover:bg-[#f9f7f4] transition-colors disabled:opacity-50"
                        >
                          <Star className={`w-3.5 h-3.5 ${review.is_featured ? 'fill-[#d4a5a5] text-[#d4a5a5]' : ''}`} />
                          {review.is_featured ? 'Unfeature' : 'Feature'}
                        </button>

                        {confirmingDeleteId === review.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={busyId === review.id}
                              className="text-xs px-2 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteId(null)}
                              className="text-xs px-2 py-1.5 rounded-lg text-[#8b8b8b] hover:bg-[#f9f7f4]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingDeleteId(review.id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

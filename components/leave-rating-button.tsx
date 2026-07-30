'use client'

import { useEffect, useState } from 'react'
import { MessageSquarePlus, X, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { StarRatingInput } from './star-rating'

export default function LeaveRatingButton() {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    api.siteSettings
      .get()
      .then(settings => setEnabled(settings.reviews_submission_enabled))
      .catch(err => console.error('Error checking review settings:', err))
  }, [])

  if (!enabled) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please select a star rating.')
      return
    }

    setSubmitting(true)
    try {
      await api.reviews.create({ name, email, rating, review_text: reviewText })
      setSubmitted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong submitting your rating. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Reset for next time, after the close animation would have finished.
    setTimeout(() => {
      setSubmitted(false)
      setName('')
      setEmail('')
      setRating(0)
      setReviewText('')
      setError('')
    }, 300)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#d4a5a5] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#c4956f] transition-colors"
        aria-label="Leave a rating"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Leave a Rating</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-[#8b8b8b] hover:text-[#2a2a2a]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#e8d4d4] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-[#d4a5a5]" />
                </div>
                <h3 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-2">Thank you!</h3>
                <p className="text-[#8b8b8b] text-sm">Your rating has been posted.</p>
                <button
                  onClick={handleClose}
                  className="mt-6 bg-[#d4a5a5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#c4956f] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif font-bold text-xl text-[#2a2a2a]">Leave a Rating</h3>

                <div>
                  <label className="block text-sm font-medium text-[#2a2a2a] mb-2">Your Rating</label>
                  <StarRatingInput value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                  />
                  <p className="text-xs text-[#8b8b8b] mt-1">
                    Your email will never be published or shown to anyone.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#d4a5a5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

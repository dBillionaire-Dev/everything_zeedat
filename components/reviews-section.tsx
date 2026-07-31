'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'
import type { Review } from '@/lib/api'
import { StarRatingDisplay } from './star-rating'

const INITIAL_COUNT = 3
const LOAD_MORE_COUNT = 3

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)

  useEffect(() => {
    api.reviews
      .list()
      .then(data => {
        // Featured reviews first, then most recent -- list() already comes
        // back sorted by created_at desc, so a stable sort on "featured"
        // alone preserves that recency order within each group.
        const sorted = [...data]
          .filter(r => r.is_visible)
          .sort((a, b) => Number(b.is_featured) - Number(a.is_featured))
        setReviews(sorted)
      })
      .catch(err => console.error('Error fetching reviews:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || reviews.length === 0) return null

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  return (
    <section id="reviews" className="py-16 bg-[#f9f7f4]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2a2a2a] mb-2">
            What Our Customers Say
          </h2>
          <p className="text-[#8b8b8b]">Real reviews from real gifting moments</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl p-6 border border-[#e8dfd9] relative">
              {review.is_featured && (
                <span className="absolute top-4 right-4 text-xs font-medium bg-[#e8d4d4] text-[#2a2a2a] px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              <StarRatingDisplay rating={review.rating} />
              <p className="text-[#2a2a2a] text-sm mt-3 leading-relaxed">&ldquo;{review.review_text}&rdquo;</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#e8dfd9]">
                <div className="w-8 h-8 rounded-full bg-[#e8d4d4] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#d4a5a5]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#2a2a2a]">{review.name}</p>
                  <p className="text-xs text-[#8b8b8b]">
                    {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(c => c + LOAD_MORE_COUNT)}
              className="border border-[#d4a5a5] text-[#d4a5a5] px-6 py-2.5 rounded-lg font-medium hover:bg-[#e8d4d4] transition-colors"
            >
              See More Reviews
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

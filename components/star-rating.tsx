'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export function StarRatingDisplay({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`${size} ${n <= rating ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#e8dfd9]'}`}
        />
      ))}
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hovered || value) ? 'fill-[#d4a5a5] text-[#d4a5a5]' : 'text-[#e8dfd9]'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

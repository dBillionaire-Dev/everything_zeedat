'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f7f4] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8d4d4] flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#d4a5a5]" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#2a2a2a] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#8b8b8b] mb-8">
          Sorry about that, an unexpected error occurred. You can try again, or head back home.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-[#e8dfd9] text-[#2a2a2a] px-6 py-3 rounded-lg font-medium hover:bg-[#f9f7f4] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

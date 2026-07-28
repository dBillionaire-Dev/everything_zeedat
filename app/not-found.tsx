import Link from 'next/link'
import Image from 'next/image'
import { Gift, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f7f4] to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[#e8d4d4] flex items-center justify-center mx-auto mb-6">
          <Image
            src="/logo.png"
            alt="Zeedat Gifts"
            width={150}
            height={150}
            className="rounded-full"
          />
        </div>

        <p className="font-serif text-6xl font-bold text-[#d4a5a5] mb-2">404</p>
        <h1 className="font-serif text-2xl font-bold text-[#2a2a2a] mb-3">
          This gift got lost in transit
        </h1>
        <p className="text-[#8b8b8b] mb-8">
          We couldn't find the page you're looking for. It may have been moved, renamed, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 border border-[#e8dfd9] text-[#2a2a2a] px-6 py-3 rounded-lg font-medium hover:bg-[#f9f7f4] transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Gifts
          </Link>
        </div>
      </div>
    </div>
  )
}

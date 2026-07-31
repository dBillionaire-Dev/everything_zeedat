'use client'

import Link from 'next/link'
import { ShoppingCart, X, Check } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function CartToast() {
  const { toast, dismissToast } = useCart()

  if (!toast) return null

  return (
    <div
      key={toast.id}
      className="fixed bottom-24 right-6 z-40 bg-white rounded-xl shadow-lg border border-[#e8dfd9] p-4 w-72 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <button
        onClick={dismissToast}
        className="absolute top-2 right-2 text-[#8b8b8b] hover:text-[#2a2a2a]"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#e8d4d4] flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-[#d4a5a5]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2a2a2a]">Added to cart</p>
          <p className="text-xs text-[#8b8b8b] truncate mt-0.5">
            {toast.name}{toast.quantity > 1 ? ` × ${toast.quantity}` : ''}
          </p>
          <Link
            href="/cart"
            onClick={dismissToast}
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[#d4a5a5] hover:text-[#c4956f]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            View Cart
          </Link>
        </div>
      </div>
    </div>
  )
}

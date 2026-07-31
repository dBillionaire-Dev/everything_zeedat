'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Search, AlertCircle } from 'lucide-react'
import { useActiveOrders, trackingPath } from '@/lib/active-orders-context'
import { api } from '@/lib/api'

export default function OrderTrackingIndexPage() {
  const router = useRouter()
  const { activeOrders, addActiveOrder } = useActiveOrders()

  const [reference, setReference] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedRef = reference.trim().toUpperCase()
    const isCustomOrder = trimmedRef.startsWith('CO-')

    try {
      if (isCustomOrder) {
        await api.customOrders.getByReference(trimmedRef, phone)
        addActiveOrder('custom-order', trimmedRef, phone)
        router.push(`/custom-order-tracking/${trimmedRef}`)
      } else {
        await api.orders.getByReference(trimmedRef, phone)
        addActiveOrder('order', trimmedRef, phone)
        router.push(`/order-tracking/${trimmedRef}`)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Order not found. Check your reference number and phone number.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">Track Your Order</h1>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {activeOrders.length === 0 ? (
          <div className="text-center py-8 mb-10">
            <div className="w-14 h-14 rounded-full bg-[#f9f7f4] flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-[#d4a5a5]" />
            </div>
            <p className="text-lg text-[#2a2a2a] font-medium mb-1">It's empty here</p>
            <p className="text-[#8b8b8b] text-sm mb-6">
              You don't have any orders placed from this device yet.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] font-medium">
              <ArrowLeft className="w-4 h-4" />
              Browse Gifts
            </Link>
          </div>
        ) : (
          <div className="mb-10">
            <h2 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
              Your Orders on This Device
            </h2>
            <div className="space-y-3">
              {[...activeOrders].reverse().map(order => (
                <Link
                  key={`${order.type}-${order.reference}`}
                  href={trackingPath(order)}
                  className="flex items-center justify-between bg-[#f9f7f4] rounded-lg p-4 hover:bg-[#f4ece7] transition-colors"
                >
                  <div>
                    <p className="font-mono font-semibold text-[#2a2a2a]">{order.reference}</p>
                    <p className="text-xs text-[#8b8b8b] mt-0.5">
                      {order.type === 'custom-order' ? 'Custom Order Request' : 'Order'} · Placed{' '}
                      {new Date(order.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-[#d4a5a5] text-sm font-medium">View Status →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Manual lookup fallback — for a different device, or a cleared browser */}
        <div className="border-t border-[#e8dfd9] pt-8">
          <h2 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-1">
            Tracking from a different device?
          </h2>
          <p className="text-sm text-[#8b8b8b] mb-4">
            Enter your order reference and the phone number used to place it.
          </p>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Reference Number</label>
              <input
                type="text"
                required
                value={reference}
                onChange={e => setReference(e.target.value)}
                placeholder="e.g. ORD-XXXXXX or CO-XXXXXX"
                className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 0813 128 8947"
                className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full bg-[#d4a5a5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Looking up...' : 'Find My Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

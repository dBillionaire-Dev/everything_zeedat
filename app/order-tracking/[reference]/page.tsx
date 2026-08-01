'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, ArrowLeft, AlertCircle, Lock, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { Order } from '@/lib/api'
import { useActiveOrders } from '@/lib/active-orders-context'
import { buildWhatsAppLink } from '@/lib/constants'

const statusSteps = [
  { status: 'RECEIVED', label: 'Order Received', icon: CheckCircle },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { status: 'PREPARING', label: 'Preparing', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const reference = params.reference as string
  const { activeOrders } = useActiveOrders()

  const [order, setOrder] = useState<Order | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)

  // Convenience only, not a security bypass: if this device already placed
  // this order, we know the phone number it used -- prefill it so the
  // customer doesn't have to retype it, but the server-side RPC still
  // requires it to match before returning anything.
  useEffect(() => {
    const match = activeOrders.find(o => o.type === 'order' && o.reference === reference)
    if (match) setPhone(match.phone)
  }, [activeOrders, reference])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setChecked(true)

    try {
      const data = await api.orders.getByReference(reference, phone)
      setOrder(data)
    } catch (err) {
      setOrder(null)
      setError(err instanceof Error ? err.message : 'Order not found.')
    } finally {
      setLoading(false)
    }
  }

  // Gate: require the phone number on the order before showing any details.
  // This is what stops a reference number alone (which shows up in URLs and
  // emails) from exposing someone else's name, address, and phone number.
  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/shop" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
              Order Tracking
            </h1>
          </div>
        </section>

        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-[#f9f7f4] rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e8d4d4] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-[#d4a5a5]" />
            </div>
            <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-2">Confirm it's you</h2>
            <p className="text-sm text-[#8b8b8b] mb-6">
              Enter the phone number used on order <span className="font-mono font-medium">{reference}</span> to
              view its status.
            </p>

            <form onSubmit={handleVerify} className="space-y-4 text-left">
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

              {checked && error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4a5a5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'View Order Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const isCancelled = order.status === 'CANCELLED'
  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/shop" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
            Order Tracking
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Order Number */}
        <div className="bg-[#f9f7f4] rounded-xl p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-[#8b8b8b] text-sm">Order Number</p>
            <p className="font-mono font-bold text-2xl text-[#2a2a2a]">{order.reference}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Status</p>
              <p className="font-semibold text-[#2a2a2a] capitalize">{order.status.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase mb-1">Payment</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                order.payment_status === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : order.payment_status === 'FAILED'
                  ? 'bg-red-100 text-red-800'
                  : order.payment_status === 'REFUNDED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {order.payment_status === 'PAID' ? '✓ Paid' : order.payment_status === 'FAILED' ? 'Failed' : order.payment_status === 'REFUNDED' ? '💸 Refunded' : 'Pending'}
              </span>
            </div>
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Total</p>
              <p className="font-semibold text-[#d4a5a5]">₦{(order.total / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Delivery Date</p>
              <p className="font-semibold text-[#2a2a2a]">{new Date(order.delivery_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-2">Order Cancelled</h2>
            <p className="text-[#8b8b8b]">
              This order has been cancelled. Reach out on WhatsApp if you have any questions.
            </p>
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-[#e8dfd9] p-8 mb-8">
          <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-8">Order Status</h2>
          <div className="space-y-6">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = currentStepIndex >= 0 && idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Step indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-[#d4a5a5]' : 'bg-[#e8dfd9]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-[#8b8b8b]'}`} />
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div
                        className={`w-1 h-12 mt-2 ${isCompleted ? 'bg-[#d4a5a5]' : 'bg-[#e8dfd9]'}`}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="pt-1">
                    <h3 className={`font-semibold ${isCurrent ? 'text-[#d4a5a5]' : 'text-[#2a2a2a]'}`}>
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <p className="text-sm text-[#8b8b8b] mt-1">
                        {step.status === 'RECEIVED' && 'We received your order. Confirming details...'}
                        {step.status === 'CONFIRMED' && 'Your order has been confirmed and is being prepared.'}
                        {step.status === 'PREPARING' && 'Our team is preparing your gift.'}
                        {step.status === 'OUT_FOR_DELIVERY' && 'Your gift is on its way!'}
                        {step.status === 'DELIVERED' && 'Your gift has been delivered. Thank you!'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}

        {/* Delivery Details */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#f9f7f4] rounded-xl p-6">
            <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
              Delivery Address
            </h3>
            <p className="text-[#8b8b8b]">{order.customer_name}</p>
            <p className="text-[#8b8b8b] mt-2">{order.delivery_address}</p>
            <p className="text-[#8b8b8b]">{order.city}, {order.state}</p>
            <p className="text-[#8b8b8b] mt-3 font-medium">{order.phone}</p>
          </div>

          <div className="bg-[#f9f7f4] rounded-xl p-6">
            <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 text-[#8b8b8b]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₦{(order.subtotal / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₦{(order.delivery_fee / 1000).toFixed(0)}k</span>
              </div>
              <div className="border-t border-[#e8dfd9] pt-2 mt-2 flex justify-between font-semibold text-[#2a2a2a]">
                <span>Total</span>
                <span className="text-[#d4a5a5]">₦{(order.total / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-[#e8d4d4] bg-opacity-50 border border-[#d4a5a5] rounded-lg p-6 text-center">
          <p className="text-[#2a2a2a] mb-4">
            Have questions about your order?
          </p>
          <a
            href={buildWhatsAppLink(`Hi! I have a question about my order (Ref: ${order.reference}) and would appreciate some help.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1fa855] transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

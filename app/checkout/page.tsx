'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, MessageCircle, PackageCheck } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useActiveOrders } from '@/lib/active-orders-context'
import { api } from '@/lib/api'
import type { DeliveryZone } from '@/lib/api'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { addActiveOrder } = useActiveOrders()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderResult, setOrderResult] = useState<{ reference: string; whatsappLink: string } | null>(null)

  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(2000)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])

  useEffect(() => {
    Promise.all([api.siteSettings.get(), api.deliveryZones.list()])
      .then(([settings, zones]) => {
        setDefaultDeliveryFee(settings.default_delivery_fee)
        setDeliveryZones(zones)
      })
      .catch(err => console.error('Error loading delivery pricing:', err))
  }, [])

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    city: '',
    state: '',
    deliveryDate: '',
    notes: '',
  })

  const matchedZone = deliveryZones.find(
    z => z.state.trim().toLowerCase() === formData.state.trim().toLowerCase()
  )
  const deliveryFee = matchedZone ? matchedZone.fee : defaultDeliveryFee
  const grandTotal = total + deliveryFee

  if (items.length === 0 && !orderResult) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-[#8b8b8b] mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-[#d4a5a5] hover:text-[#c4956f]">
          Back to Shop
        </Link>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          deliveryAddress: formData.deliveryAddress,
          city: formData.city,
          state: formData.state,
          deliveryDate: formData.deliveryDate,
          notes: formData.notes,
          subtotal: total,
          deliveryFee,
          total: grandTotal,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            customization: item.customization,
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to place order')

      clear()
      addActiveOrder('order', data.reference, formData.phone)
      setOrderResult({ reference: data.reference, whatsappLink: data.whatsappLink })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (orderResult) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8d4d4] flex items-center justify-center mb-6">
          <PackageCheck className="w-8 h-8 text-[#d4a5a5]" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#2a2a2a] mb-2">Order Received!</h1>
        <p className="text-[#8b8b8b] mb-1">Your reference number is</p>
        <p className="font-mono font-bold text-xl text-[#2a2a2a] mb-6">{orderResult.reference}</p>
        <p className="text-[#8b8b8b] max-w-md mb-8">
          The last step is confirming your order and payment directly with Zeedat on WhatsApp, she'll take it
          from here.
        </p>

        <a
          href={orderResult.whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1fa855] transition-colors mb-4"
        >
          <MessageCircle className="w-5 h-5" />
          Confirm Order on WhatsApp
        </a>

        <Link
          href={`/order-tracking/${orderResult.reference}`}
          className="text-[#d4a5a5] hover:text-[#c4956f] text-sm"
        >
          Track this order
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
            Checkout
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                <p className="text-[#991b1b] text-sm">{error}</p>
              </div>
            )}

            {/* Personal Info */}
            <div className="bg-[#f9f7f4] rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="customerName"
                  placeholder="Full Name"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                />
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                  />
                  <p className="text-xs text-[#8b8b8b] mt-1.5">
                    💌 Add your email to get automatic updates as your order is confirmed, prepared, and delivered.
                    Without it, you'll need to check back manually via Track Order.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-[#f9f7f4] rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                Delivery Information
              </h3>
              <div className="space-y-4">
                <textarea
                  name="deliveryAddress"
                  placeholder="Delivery Address"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] resize-none"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State/Region"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                  />
                </div>
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                />
                <textarea
                  name="notes"
                  placeholder="Special Instructions (optional)"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] resize-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#f9f7f4] rounded-xl p-6">
              <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-[#e8dfd9] rounded-lg bg-white">
                  <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                  <span className="flex-1">
                    <p className="font-medium text-[#2a2a2a]">Confirm via WhatsApp</p>
                    <p className="text-sm text-[#8b8b8b]">
                      We'll send your order details to Zeedat's WhatsApp to confirm payment and delivery.
                    </p>
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-dashed border-[#e8dfd9] rounded-lg opacity-60">
                  <span className="flex-1">
                    <p className="font-medium text-[#2a2a2a]">Pay with Paystack</p>
                    <p className="text-sm text-[#8b8b8b]">Coming soon</p>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#f9f7f4] rounded-xl p-6 sticky top-20">
              <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-[#e8dfd9] max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-[#8b8b8b]">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-[#2a2a2a]">
                      ₦{(item.price * item.quantity / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 pb-4 border-b border-[#e8dfd9]">
                <div className="flex justify-between text-[#8b8b8b]">
                  <span>Subtotal</span>
                  <span>₦{(total / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between text-[#8b8b8b]">
                  <span>Delivery</span>
                  <span>₦{(deliveryFee / 1000).toFixed(0)}k</span>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="font-serif font-bold text-lg text-[#2a2a2a]">Total</span>
                <span className="font-serif font-bold text-lg text-[#d4a5a5]">
                  ₦{(grandTotal / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

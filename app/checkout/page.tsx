'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { api } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const deliveryFee = 2000
  const grandTotal = total + deliveryFee

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    city: '',
    state: '',
    deliveryDate: '',
    notes: '',
    paymentMethod: 'WHATSAPP_MANUAL' as const,
  })

  if (items.length === 0) {
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
      const orderData = {
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
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization,
        })),
      }

      const order = await api.orders.create(orderData)
      clear()

      // Redirect to order confirmation
      router.push(`/order-tracking/${order.reference}`)
    } catch (err) {
      setError('Failed to create order. Please try again.')
      console.error('[v0] Checkout error:', err)
    } finally {
      setLoading(false)
    }
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
                <input
                  type="email"
                  name="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                />
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
                <label className="flex items-center gap-3 p-3 border border-[#e8dfd9] rounded-lg cursor-pointer hover:bg-white">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WHATSAPP_MANUAL"
                    checked={formData.paymentMethod === 'WHATSAPP_MANUAL'}
                    onChange={handleInputChange}
                  />
                  <span className="flex-1">
                    <p className="font-medium text-[#2a2a2a]">WhatsApp Payment</p>
                    <p className="text-sm text-[#8b8b8b]">Confirm payment via WhatsApp message</p>
                  </span>
                </label>
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

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Package, Truck, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Order } from '@/lib/api'

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

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.orders.getByReference(reference)
        setOrder(data)
      } catch (error) {
        console.error('[v0] Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [reference])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#8b8b8b]">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-lg text-[#8b8b8b] mb-4">Order not found</p>
        <Link href="/shop" className="text-[#d4a5a5] hover:text-[#c4956f] flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>
    )
  }

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
              <p className="text-xs text-[#8b8b8b] uppercase">Payment</p>
              <p className="font-semibold text-[#2a2a2a]">{order.payment_status}</p>
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
        <div className="bg-white rounded-xl border border-[#e8dfd9] p-8 mb-8">
          <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-8">Order Status</h2>
          <div className="space-y-6">
            {statusSteps.map((step, idx) => {
              const Icon = step.icon
              const isCompleted = idx <= currentStepIndex
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
            href={`https://wa.me/2348131288947?text=Hi!%20I%20have%20a%20question%20about%20my%20order%20${order.reference}.`}
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

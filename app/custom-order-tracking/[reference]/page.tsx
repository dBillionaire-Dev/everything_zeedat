'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Search, Package, Truck, ArrowLeft, AlertCircle, Lock, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { CustomOrderRequest } from '@/lib/api'
import { useActiveOrders } from '@/lib/active-orders-context'
import { buildWhatsAppLink } from '@/lib/constants'

const statusSteps = [
  { status: 'NEW', label: 'Request Received', icon: CheckCircle, blurb: "We've received your request and will review it shortly." },
  { status: 'REVIEWED', label: 'Reviewed', icon: Search, blurb: "We've reviewed your request and are working out the details." },
  { status: 'QUOTED', label: 'Quote Ready', icon: CheckCircle, blurb: "We've put together a quote — we'll reach out on WhatsApp with the details." },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, blurb: "Your request is confirmed and we're getting started!" },
  { status: 'PREPARING', label: 'Preparing', icon: Package, blurb: "We're preparing your custom gift with care." },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, blurb: 'Your custom gift is on its way!' },
  { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle, blurb: 'Your custom gift has been delivered. We hope it brought a smile!' },
]

const budgetLabels: Record<string, string> = {
  'under-10k': 'Under ₦10,000',
  '10k-25k': '₦10,000 - ₦25,000',
  '25k-50k': '₦25,000 - ₦50,000',
  '50k-plus': '₦50,000+',
}

export default function CustomOrderTrackingPage() {
  const params = useParams()
  const reference = params.reference as string
  const { activeOrders } = useActiveOrders()

  const [request, setRequest] = useState<CustomOrderRequest | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)

  // Same convenience-only prefill as regular order tracking -- doesn't
  // bypass the server-side phone check, just saves retyping on this device.
  useEffect(() => {
    const match = activeOrders.find(o => o.type === 'custom-order' && o.reference === reference)
    if (match) setPhone(match.phone)
  }, [activeOrders, reference])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setChecked(true)

    try {
      const data = await api.customOrders.getByReference(reference, phone)
      setRequest(data)
    } catch (err) {
      setRequest(null)
      setError(err instanceof Error ? err.message : 'Request not found.')
    } finally {
      setLoading(false)
    }
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white">
        <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Link href="/custom-orders" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Custom Orders
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
              Custom Order Tracking
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
              Enter the phone number used on request <span className="font-mono font-medium">{reference}</span> to
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
                {loading ? 'Checking...' : 'View Request Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const isDeclined = request.status === 'DECLINED'
  const currentStepIndex = statusSteps.findIndex(s => s.status === request.status)

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/custom-orders" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Custom Orders
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
            Custom Order Tracking
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Reference Number */}
        <div className="bg-[#f9f7f4] rounded-xl p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-[#8b8b8b] text-sm">Request Reference</p>
            <p className="font-mono font-bold text-2xl text-[#2a2a2a]">{request.reference}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Occasion</p>
              <p className="font-semibold text-[#2a2a2a]">{request.occasion}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Budget</p>
              <p className="font-semibold text-[#2a2a2a]">{budgetLabels[request.budget_range] || request.budget_range}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b8b8b] uppercase">Submitted</p>
              <p className="font-semibold text-[#2a2a2a]">{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {isDeclined ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-2">Request Declined</h2>
            <p className="text-[#8b8b8b]">
              We're unable to fulfill this request. Reach out on WhatsApp if you'd like to discuss alternatives.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e8dfd9] p-8 mb-8">
            <h2 className="font-serif font-semibold text-xl text-[#2a2a2a] mb-8">Request Status</h2>
            <div className="space-y-6">
              {statusSteps.map((step, idx) => {
                const Icon = step.icon
                const isCompleted = currentStepIndex >= 0 && idx <= currentStepIndex
                const isCurrent = idx === currentStepIndex

                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-[#d4a5a5]' : 'bg-[#e8dfd9]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-[#8b8b8b]'}`} />
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`w-1 h-12 mt-2 ${isCompleted ? 'bg-[#d4a5a5]' : 'bg-[#e8dfd9]'}`} />
                      )}
                    </div>

                    <div className="pt-1">
                      <h3 className={`font-semibold ${isCurrent ? 'text-[#d4a5a5]' : 'text-[#2a2a2a]'}`}>
                        {step.label}
                      </h3>
                      {isCurrent && <p className="text-sm text-[#8b8b8b] mt-1">{step.blurb}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Request Details */}
        <div className="bg-[#f9f7f4] rounded-xl p-6 mb-8">
          <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">What You Asked For</h3>
          <p className="text-[#8b8b8b] whitespace-pre-wrap">{request.description}</p>
          {request.preferred_delivery_date && (
            <p className="text-[#8b8b8b] mt-3">
              <span className="font-medium text-[#2a2a2a]">Preferred delivery date:</span>{' '}
              {new Date(request.preferred_delivery_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-[#e8d4d4] bg-opacity-50 border border-[#d4a5a5] rounded-lg p-6 text-center">
          <p className="text-[#2a2a2a] mb-4">Have questions about your request?</p>
          <a
            href={buildWhatsAppLink(`Hi! I have a question about my custom order request (Ref: ${request.reference}) and would appreciate some help.`)}
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

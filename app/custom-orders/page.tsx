'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle, ImagePlus, X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadReferenceImage, UploadError } from '@/lib/upload'

export default function CustomOrdersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    occasion: '',
    budgetRange: 'under-10k' as const,
    description: '',
    preferredDeliveryDate: '',
  })

  const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null)
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError('')
    setReferenceImageFile(file)
    setReferenceImagePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setReferenceImageFile(null)
    setReferenceImagePreview(null)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let referenceImageUrl: string | null = null

      if (referenceImageFile) {
        setImageUploading(true)
        try {
          referenceImageUrl = await uploadReferenceImage(referenceImageFile)
        } catch (uploadErr) {
          const message =
            uploadErr instanceof UploadError
              ? uploadErr.message
              : 'Failed to upload image. You can still submit without it.'
          setImageError(message)
          setLoading(false)
          setImageUploading(false)
          return
        } finally {
          setImageUploading(false)
        }
      }

      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          occasion: formData.occasion,
          budgetRange: formData.budgetRange,
          description: formData.description,
          preferredDeliveryDate: formData.preferredDeliveryDate || null,
          referenceImage: referenceImageUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit request')
      }

      const data = await response.json()
      setSubmitted(true)
      // Store reference ID for display
      localStorage.setItem('lastOrderReference', data.referenceId)
      setTimeout(() => router.push('/'), 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit request. Please try again or contact us via WhatsApp.'
      )
      console.error('[v0] Custom order error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    const referenceId = typeof window !== 'undefined' ? localStorage.getItem('lastOrderReference') : null

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8d4d4] to-white flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#e8d4d4] rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-[#d4a5a5]" />
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold text-[#2a2a2a] mb-2">
            Request Received!
          </h1>

          <div className="bg-[#f9f7f4] rounded-lg p-4 my-6">
            <p className="text-xs text-[#8b8b8b] uppercase tracking-wide mb-1">Reference ID</p>
            <p className="font-mono text-lg font-semibold text-[#d4a5a5]">{referenceId || 'Processing...'}</p>
          </div>

          <p className="text-[#8b8b8b] mb-4 leading-relaxed">
            <strong>What happens next:</strong>
          </p>

          <ul className="text-left space-y-3 mb-6">
            <li className="flex gap-3 text-sm text-[#666]">
              <span className="text-[#d4a5a5] font-bold flex-shrink-0">✓</span>
              <span>Confirmation email sent to your email address</span>
            </li>
            <li className="flex gap-3 text-sm text-[#666]">
              <span className="text-[#d4a5a5] font-bold flex-shrink-0">✓</span>
              <span>Form details saved with your reference ID</span>
            </li>
            <li className="flex gap-3 text-sm text-[#666]">
              <span className="text-[#d4a5a5] font-bold flex-shrink-0">✓</span>
              <span>We'll contact you via WhatsApp within 24 hours</span>
            </li>
            <li className="flex gap-3 text-sm text-[#666]">
              <span className="text-[#d4a5a5] font-bold flex-shrink-0">✓</span>
              <span>Personalized proposal & quote coming soon</span>
            </li>
          </ul>

          <div className="bg-[#d4a5a5] bg-opacity-20 border border-[#d4a5a5] rounded-lg p-3 mb-6">
            <p className="text-xs text-[#2a2a2a]">
              <strong>Need faster response?</strong> Message us on WhatsApp with your reference ID.
            </p>
          </div>

          <a
            href="https://wa.me/2348131288947"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-[#25d366] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1fa857] transition-colors mb-3"
          >
            💬 Message on WhatsApp
          </a>

          <p className="text-xs text-[#8b8b8b]">Redirecting to home in a moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a] mb-2">
            Custom Gift Request
          </h1>
          <p className="text-lg text-[#8b8b8b]">
            Tell us your vision, and let&apos;s create something special together
          </p>
        </div>
      </section>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#fee2e2] border border-[#fca5a5] rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
              <p className="text-[#991b1b]">{error}</p>
            </div>
          )}

          {/* Personal Info */}
          <div className="bg-[#f9f7f4] rounded-xl p-6">
            <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
              Your Information
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
                placeholder="WhatsApp Number"
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

          {/* Gift Details */}
          <div className="bg-[#f9f7f4] rounded-xl p-6">
            <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
              Gift Details
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                name="occasion"
                placeholder="What&apos;s the occasion? (e.g., Wedding, Birthday, Corporate Gift)"
                value={formData.occasion}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
              />

              <select
                          style={{ colorScheme: 'light' }}
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
              >
                <option value="under-10k">Under ₦10,000</option>
                <option value="10k-25k">₦10,000 - ₦25,000</option>
                <option value="25k-50k">₦25,000 - ₦50,000</option>
                <option value="50k-plus">₦50,000+</option>
              </select>

              <textarea
                name="description"
                placeholder="Describe your vision. Include details like recipient interests, preferred colors, themes, and any specific items you&apos;d like included..."
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] resize-none"
              />

              <div>
                <label className="block text-sm font-medium text-[#2a2a2a] mb-2">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  name="preferredDeliveryDate"
                  value={formData.preferredDeliveryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2a2a2a] mb-2">
                  Reference Image (optional)
                </label>

                {referenceImagePreview ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={referenceImagePreview}
                      alt="Reference preview"
                      className="w-32 h-32 object-cover rounded-lg border border-[#e8dfd9]"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-[#e8dfd9]"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5 text-[#2a2a2a]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#e8dfd9] rounded-lg text-[#8b8b8b] hover:border-[#d4a5a5] hover:text-[#d4a5a5] transition-colors w-full justify-center"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Add a photo of what you have in mind
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {imageError && (
                  <p className="text-sm text-[#ef4444] mt-2">{imageError}</p>
                )}
                <p className="text-xs text-[#8b8b8b] mt-2">JPG, PNG, WEBP, or HEIC — up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#e8d4d4] bg-opacity-50 border border-[#d4a5a5] rounded-lg p-4">
            <p className="text-sm text-[#2a2a2a]">
              <span className="font-semibold">Next Steps:</span> After you submit this form, our gift experts will review your request and contact you via WhatsApp with a personalized proposal and pricing within 24 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {imageUploading ? 'Uploading image...' : loading ? 'Submitting...' : 'Submit Custom Gift Request'}
          </button>

          <p className="text-center text-sm text-[#8b8b8b]">
            Want to browse our ready-made collections first?{' '}
            <Link href="/shop" className="text-[#d4a5a5] hover:text-[#c4956f] font-medium">
              Shop Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

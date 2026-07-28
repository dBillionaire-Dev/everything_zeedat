'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ImagePlus, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product, CustomizationOption } from '@/lib/api'
import { uploadProductImage, deleteProductImage, UploadError } from '@/lib/upload'

function newCustomizationOption(): CustomizationOption {
  return {
    id: crypto.randomUUID(),
    label: '',
    type: 'text',
    extraCost: 0,
  }
}

const CATEGORIES = [
  { value: 'hampers', label: 'Hampers' },
  { value: 'gift-boxes', label: 'Gift Boxes' },
  { value: 'occasion-gifts', label: 'Occasion Gifts' },
  { value: 'accessories', label: 'Accessories' },
] as const

const STOCK_STATUSES = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
] as const

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Props {
  mode: 'create' | 'edit'
  initialProduct?: Product
}

export default function AdminProductForm({ mode, initialProduct }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialProduct?.name ?? '')
  const [slug, setSlug] = useState(initialProduct?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [description, setDescription] = useState(initialProduct?.description ?? '')
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? '')
  const [category, setCategory] = useState<Product['category']>(initialProduct?.category ?? 'gift-boxes')
  const [occasionTags, setOccasionTags] = useState(initialProduct?.occasion_tags?.join(', ') ?? '')
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? [])
  const [isCustomizable, setIsCustomizable] = useState(initialProduct?.is_customizable ?? false)
  const [customizations, setCustomizations] = useState<CustomizationOption[]>(
    initialProduct?.customization_options?.options ?? []
  )
  const [stockStatus, setStockStatus] = useState<Product['stock_status']>(initialProduct?.stock_status ?? 'in-stock')
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false)

  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setImageError('')
    setImageUploading(true)
    try {
      const url = await uploadProductImage(file)
      setImages(prev => [...prev, url])
    } catch (err) {
      setImageError(err instanceof UploadError ? err.message : 'Failed to upload image.')
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = async (url: string) => {
    setImages(prev => prev.filter(i => i !== url))
    await deleteProductImage(url)
  }

  const addCustomization = () => {
    setCustomizations(prev => [...prev, newCustomizationOption()])
  }

  const updateCustomization = (id: string, updates: Partial<CustomizationOption>) => {
    setCustomizations(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)))
  }

  const removeCustomization = (id: string) => {
    setCustomizations(prev => prev.filter(c => c.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !slug.trim() || !price) {
      setError('Name, slug, and price are required.')
      return
    }

    const priceValue = Number(price)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError('Price must be a valid non-negative number.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: priceValue,
        category,
        occasion_tags: occasionTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        images,
        is_customizable: isCustomizable,
        customization_options: {
          options: isCustomizable
            ? customizations
                .filter(c => c.label.trim())
                .map(c => ({
                  ...c,
                  label: c.label.trim(),
                  extraCost: Number(c.extraCost) || 0,
                  choices: c.type === 'select' ? (c.choices || []).filter(Boolean) : undefined,
                }))
            : [],
        },
        stock_status: stockStatus,
        is_featured: isFeatured,
      }

      if (mode === 'create') {
        await api.products.create(payload)
      } else if (initialProduct) {
        await api.products.update(initialProduct.id, payload)
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 space-y-4">
        <h3 className="font-serif font-semibold text-lg text-[#2a2a2a]">Basics</h3>

        <div>
          <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Slug</label>
          <input
            type="text"
            required
            value={slug}
            onChange={e => {
              setSlugTouched(true)
              setSlug(e.target.value)
            }}
            className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] font-mono text-sm"
          />
          <p className="text-xs text-[#8b8b8b] mt-1">Used in the product URL: /shop/{slug || '...'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Price (₦)</label>
            <input
              type="number"
              min="0"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Category</label>
            <select
                          style={{ colorScheme: 'light' }}
              value={category}
              onChange={e => setCategory(e.target.value as Product['category'])}
              className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
            Occasion tags <span className="text-[#8b8b8b] font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={occasionTags}
            onChange={e => setOccasionTags(e.target.value)}
            placeholder="birthday, anniversary, just-because"
            className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 space-y-4">
        <h3 className="font-serif font-semibold text-lg text-[#2a2a2a]">Photos</h3>

        <div className="flex flex-wrap gap-3">
          {images.map(url => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-[#e8dfd9]" />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-[#e8dfd9]"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5 text-[#2a2a2a]" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#e8dfd9] rounded-lg text-[#8b8b8b] hover:border-[#d4a5a5] hover:text-[#d4a5a5] transition-colors disabled:opacity-50"
          >
            {imageUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            <span className="text-xs">{imageUploading ? 'Uploading' : 'Add photo'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleImageSelect}
          className="hidden"
        />

        {imageError && <p className="text-sm text-[#ef4444]">{imageError}</p>}
        <p className="text-xs text-[#8b8b8b]">JPG, PNG, WEBP, or HEIC — up to 5MB each</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 space-y-4">
        <h3 className="font-serif font-semibold text-lg text-[#2a2a2a]">Availability</h3>

        <div>
          <label className="block text-sm font-medium text-[#2a2a2a] mb-1">Stock Status</label>
          <select
                          style={{ colorScheme: 'light' }}
            value={stockStatus}
            onChange={e => setStockStatus(e.target.value as Product['stock_status'])}
            className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
          >
            {STOCK_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isCustomizable} onChange={e => setIsCustomizable(e.target.checked)} />
          <span className="text-sm text-[#2a2a2a]">Customers can request customization on this item</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
          <span className="text-sm text-[#2a2a2a]">Feature this product on the homepage</span>
        </label>
      </div>

      {isCustomizable && (
        <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-lg text-[#2a2a2a]">Customization Options</h3>
            <button
              type="button"
              onClick={addCustomization}
              className="flex items-center gap-1.5 text-sm text-[#d4a5a5] hover:text-[#c4956f] font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          {customizations.length === 0 ? (
            <p className="text-sm text-[#8b8b8b]">
              No customization options yet. Add one — e.g. "Engraved Name" (+₦2,000) or "Ribbon Color" with choices.
            </p>
          ) : (
            <div className="space-y-4">
              {customizations.map(option => (
                <div key={option.id} className="border border-[#e8dfd9] rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#8b8b8b] mb-1">Label</label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={e => updateCustomization(option.id, { label: e.target.value })}
                            placeholder="e.g. Engraved Name"
                            className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#8b8b8b] mb-1">Extra Cost (₦)</label>
                          <input
                            type="number"
                            min="0"
                            value={option.extraCost}
                            onChange={e => updateCustomization(option.id, { extraCost: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#8b8b8b] mb-1">Input Type</label>
                        <select
                          style={{ colorScheme: 'light' }}
                          value={option.type}
                          onChange={e => updateCustomization(option.id, { type: e.target.value as 'text' | 'select' })}
                          className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                        >
                          <option value="text">Free text (e.g. a name or message)</option>
                          <option value="select">Choose from a list</option>
                        </select>
                      </div>

                      {option.type === 'select' && (
                        <div>
                          <label className="block text-xs font-medium text-[#8b8b8b] mb-1">
                            Choices <span className="font-normal">(comma-separated)</span>
                          </label>
                          <input
                            type="text"
                            value={(option.choices || []).join(', ')}
                            onChange={e =>
                              updateCustomization(option.id, {
                                choices: e.target.value.split(',').map(c => c.trim()),
                              })
                            }
                            placeholder="Red, Gold, Pink"
                            className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCustomization(option.id)}
                      className="p-2 text-[#8b8b8b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove customization option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-[#8b8b8b]">
            Extra cost is added to the base price whenever a customer fills in or selects this option.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#d4a5a5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 rounded-lg font-medium text-[#8b8b8b] hover:bg-[#f9f7f4] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, ShoppingCart, ArrowLeft, Minus, Plus, Check } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { buildWhatsAppLink } from '@/lib/constants'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { addItem } = useCart()
  const { toggle, isSaved, remove } = useWishlist()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [justAdded, setJustAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.products.getBySlug(slug)
        setProduct(data)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><p>Loading...</p></div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-[#8b8b8b] mb-4">Product not found</p>
        <button onClick={() => router.push('/shop')} className="text-[#d4a5a5] hover:text-[#c4956f]">
          Back to Shop
        </button>
      </div>
    )
  }

  const customizationOptions = product.customization_options?.options ?? []

  const extraCost = customizationOptions.reduce((sum, opt) => {
    const value = customizationValues[opt.id]
    return value ? sum + opt.extraCost : sum
  }, 0)

  const unitPrice = product.price + extraCost

  const handleAddToCart = () => {
    const customizationLabels: Record<string, string> = {}
    for (const opt of customizationOptions) {
      const value = customizationValues[opt.id]
      if (value) customizationLabels[opt.label] = value
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
      image: product.images?.[0],
      slug: product.slug,
      customization: Object.keys(customizationLabels).length > 0 ? customizationLabels : undefined,
    })
    // Once something is in the cart, it doesn't need to stay on the wishlist too.
    remove(product.id)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const wishlisted = isSaved(product.id)

  const handleToggleWishlist = () => {
    toggle({ productId: product.id, name: product.name, price: product.price, slug: product.slug, image: product.images?.[0] })
  }

  const categoryLabel = {
    'hampers': 'Hamper',
    'gift-boxes': 'Gift Box',
    'occasion-gifts': 'Occasion Gift',
    'accessories': 'Accessory',
  }[product.category] || product.category

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => router.push('/shop')}
          className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>
      </div>

      {/* Product */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <div className="aspect-square bg-[#e8d4d4] rounded-2xl flex items-center justify-center sticky top-20 overflow-hidden">
              {product.images?.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#d4a5a5] opacity-20 mb-4" />
                  <p className="text-[#8b8b8b]">{categoryLabel}</p>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-[#d4a5a5]' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-4">
              <span className="text-xs font-medium text-[#d4a5a5] uppercase">{categoryLabel}</span>
              {product.is_featured && (
                <span className="ml-2 text-xs font-medium text-[#c4956f] uppercase bg-[#f4e4d0] px-2 py-1 rounded">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-serif font-bold text-[#2a2a2a] mb-4">
              {product.name}
            </h1>

            <p className="text-lg text-[#8b8b8b] mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-[#e8dfd9]">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-serif font-bold text-[#d4a5a5]">
                  ₦{unitPrice.toLocaleString()}
                </span>
                <span className="text-sm text-[#8b8b8b]">
                  {product.stock_status === 'in-stock' ? 'In Stock' : product.stock_status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                </span>
              </div>
              {extraCost > 0 && (
                <p className="text-sm text-[#8b8b8b] mt-1">
                  ₦{product.price.toLocaleString()} base + ₦{extraCost.toLocaleString()} customization
                </p>
              )}
            </div>

            {/* Customization */}
            {product.is_customizable && customizationOptions.length > 0 && (
              <div className="mb-8 pb-8 border-b border-[#e8dfd9]">
                <h3 className="font-serif font-semibold text-[#2a2a2a] mb-3">
                  Customization Options
                </h3>
                <div className="space-y-4">
                  {customizationOptions.map(option => (
                    <div key={option.id}>
                      <label className="block text-sm font-medium text-[#2a2a2a] mb-1">
                        {option.label}
                        {option.extraCost > 0 && (
                          <span className="text-[#d4a5a5] font-normal"> (+₦{option.extraCost.toLocaleString()})</span>
                        )}
                      </label>
                      {option.type === 'text' ? (
                        <input
                          type="text"
                          value={customizationValues[option.id] || ''}
                          onChange={e =>
                            setCustomizationValues(prev => ({ ...prev, [option.id]: e.target.value }))
                          }
                          placeholder={`Enter ${option.label.toLowerCase()}`}
                          className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                        />
                      ) : (
                        <select
                          style={{ colorScheme: 'light' }}
                          value={customizationValues[option.id] || ''}
                          onChange={e =>
                            setCustomizationValues(prev => ({ ...prev, [option.id]: e.target.value }))
                          }
                          className="w-full px-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                        >
                          <option value="">None</option>
                          {(option.choices || []).map(choice => (
                            <option key={choice} value={choice}>{choice}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.occasion_tags && product.occasion_tags.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-medium text-[#8b8b8b] mb-3">Perfect for:</p>
                <div className="flex flex-wrap gap-2">
                  {product.occasion_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#f9f7f4] text-[#2a2a2a] text-xs rounded-full capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-[#2a2a2a]">Quantity</span>
                <div className="flex items-center border border-[#e8dfd9] rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#f9f7f4]"
                  >
                    <Minus className="w-4 h-4 text-[#8b8b8b]" />
                  </button>
                  <span className="px-4 py-2 font-medium text-[#2a2a2a]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[#f9f7f4]"
                  >
                    <Plus className="w-4 h-4 text-[#8b8b8b]" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock_status === 'out-of-stock'}
                className="w-full bg-[#d4a5a5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#c4956f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {justAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {justAdded ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={handleToggleWishlist}
                className="w-full border-2 border-[#e8dfd9] text-[#2a2a2a] px-6 py-3 rounded-lg font-medium hover:border-[#d4a5a5] transition-colors flex items-center justify-center gap-2"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#d4a5a5] text-[#d4a5a5]' : ''}`} />
                {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>

              <a
                href={buildWhatsAppLink(`Hi! I'm interested in ${product.name} and would love to know more before ordering.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1fa855] transition-colors text-center"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

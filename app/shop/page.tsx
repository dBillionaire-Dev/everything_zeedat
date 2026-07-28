'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'
import { useWishlist } from '@/lib/wishlist-context'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const { toggle, isSaved } = useWishlist()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.list()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('[v0] Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory))
    }
  }, [selectedCategory, products])

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'hampers', label: 'Hampers' },
    { value: 'gift-boxes', label: 'Gift Boxes' },
    { value: 'occasion-gifts', label: 'Occasion Gifts' },
    { value: 'accessories', label: 'Accessories' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#e8d4d4] to-[#f4e4d0] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2a2a2a]">
            Our Collections
          </h1>
          <p className="text-[#8b8b8b] mt-2 text-lg">
            Discover thoughtfully curated gifts for every occasion
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-20">
              <h3 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-[#d4a5a5] text-white'
                        : 'bg-[#f9f7f4] text-[#2a2a2a] hover:bg-[#e8d4d4]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[#8b8b8b]">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#8b8b8b]">No products found in this category</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                    <div className="bg-white rounded-xl overflow-hidden border border-[#e8dfd9] hover:border-[#d4a5a5] transition-all hover:shadow-lg">
                      <div className="aspect-square bg-[#e8d4d4] flex items-center justify-center relative overflow-hidden">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#d4a5a5] opacity-20 mb-2" />
                            <p className="text-xs text-[#8b8b8b]">{product.category}</p>
                          </div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-3 right-3 bg-[#d4a5a5] text-white text-xs px-3 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif font-semibold text-[#2a2a2a] line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-[#8b8b8b] text-sm line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-lg text-[#d4a5a5]">
                            ₦{(product.price / 1000).toFixed(0)}k
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggle({ productId: product.id, name: product.name, price: product.price, slug: product.slug, image: product.images?.[0] })
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isSaved(product.id) ? 'bg-[#d4a5a5]' : 'bg-[#e8d4d4] hover:bg-[#d4a5a5]'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isSaved(product.id) ? 'fill-white text-white' : 'text-[#d4a5a5]'}`} />
                          </button>
                        </div>
                        {product.is_customizable && (
                          <p className="text-xs text-[#d4a5a5] mt-2 font-medium">
                            Customizable available
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

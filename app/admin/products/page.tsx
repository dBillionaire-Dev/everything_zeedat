'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.list()
        setProducts(data)
      } catch (error) {
        console.error('[v0] Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Products Management</h1>
          <div />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#8b8b8b]">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e8dfd9]">
            <p className="text-[#8b8b8b]">No products found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e8dfd9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8dfd9] bg-[#f9f7f4]">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Featured</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-[#e8dfd9] hover:bg-[#faf8f6]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2a2a2a]">{product.name}</p>
                          <p className="text-xs text-[#8b8b8b]">{product.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2a2a2a] capitalize">
                        {product.category.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#d4a5a5]">
                        ₦{(product.price / 1000).toFixed(0)}k
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock_status === 'in-stock'
                            ? 'bg-green-100 text-green-800'
                            : product.stock_status === 'low-stock'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.is_featured ? (
                          <span className="text-green-600 font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-[#8b8b8b]">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.is_customizable ? (
                          <span className="text-[#d4a5a5] font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-[#8b8b8b]">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-[#e8d4d4] bg-opacity-50 border border-[#d4a5a5] rounded-lg p-6">
          <p className="text-[#2a2a2a]">
            <span className="font-semibold">Note:</span> To add or edit products, you can use the Supabase dashboard directly or integrate a product editor here. Currently showing {products.length} products in your catalog.
          </p>
        </div>
      </div>
    </div>
  )
}

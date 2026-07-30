'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.products.list()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api.products.remove(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

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
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#d4a5a5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c4956f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
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
            <p className="text-[#8b8b8b] mb-4">No products found</p>
            <Link href="/admin/products/new" className="text-[#d4a5a5] hover:text-[#c4956f] font-medium">
              Add your first product
            </Link>
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
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#2a2a2a]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-[#e8dfd9] hover:bg-[#faf8f6]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-[#e8dfd9]"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#2a2a2a]">{product.name}</p>
                            <p className="text-xs text-[#8b8b8b]">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2a2a2a] capitalize">
                        {product.category.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#d4a5a5]">
                        ₦{product.price.toLocaleString()}
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-[#8b8b8b] hover:text-[#d4a5a5] hover:bg-[#f9f7f4] rounded-lg transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {confirmingId === product.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                className="text-xs px-2 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {deletingId === product.id ? 'Deleting...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setConfirmingId(null)}
                                className="text-xs px-2 py-1.5 rounded-lg text-[#8b8b8b] hover:bg-[#f9f7f4]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmingId(product.id)}
                              className="p-2 text-[#8b8b8b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

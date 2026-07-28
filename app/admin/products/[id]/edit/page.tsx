'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api'
import AdminProductForm from '@/components/admin-product-form'

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.products
      .getOne(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/products" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f]">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Edit Product</h1>
          <div />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-[#8b8b8b]">Loading...</p>
        ) : notFound || !product ? (
          <p className="text-[#8b8b8b]">Product not found.</p>
        ) : (
          <AdminProductForm mode="edit" initialProduct={product} />
        )}
      </div>
    </div>
  )
}

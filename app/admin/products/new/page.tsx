'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AdminProductForm from '@/components/admin-product-form'

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/products" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f]">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">New Product</h1>
          <div />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminProductForm mode="create" />
      </div>
    </div>
  )
}

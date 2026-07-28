'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MessageSquare, Settings } from 'lucide-react'
import { api } from '@/lib/api'

export default function AdminPage() {
  const [stats, setStats] = useState({ orders: 0, customOrders: 0, products: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersData, customOrdersData, productsData] = await Promise.all([
          api.orders.list(),
          api.customOrders.list(),
          api.products.list(),
        ])

        setStats({
          orders: ordersData.length,
          customOrders: customOrdersData.length,
          products: productsData.length,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Admin Dashboard</h1>
          <Link href="/" className="text-[#d4a5a5] hover:text-[#c4956f]">
            Back to Store
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 border border-[#e8dfd9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Total Orders</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.orders}</p>
              </div>
              <Package className="w-12 h-12 text-[#d4a5a5] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e8dfd9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Custom Requests</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.customOrders}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-[#d4a5a5] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#e8dfd9]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Products</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.products}</p>
              </div>
              <Settings className="w-12 h-12 text-[#d4a5a5] opacity-20" />
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/orders"
            className="bg-white rounded-xl p-8 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors group"
          >
            <Package className="w-8 h-8 text-[#d4a5a5] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-semibold text-[#2a2a2a] mb-2">Manage Orders</h3>
            <p className="text-[#8b8b8b]">View, update, and track all orders</p>
          </Link>

          <Link
            href="/admin/custom-orders"
            className="bg-white rounded-xl p-8 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors group"
          >
            <MessageSquare className="w-8 h-8 text-[#d4a5a5] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-semibold text-[#2a2a2a] mb-2">Custom Orders</h3>
            <p className="text-[#8b8b8b]">Review and respond to custom gift requests</p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-xl p-8 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors group"
          >
            <Settings className="w-8 h-8 text-[#d4a5a5] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-semibold text-[#2a2a2a] mb-2">Products</h3>
            <p className="text-[#8b8b8b]">Add, edit, and manage your product catalog</p>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-[#e8d4d4] bg-opacity-50 border border-[#d4a5a5] rounded-lg p-6">
          <p className="text-[#2a2a2a]">
            <span className="font-semibold">Admin Tip:</span> Use the navigation above to manage orders, custom requests, and products. Changes are saved in real-time to your database.
          </p>
        </div>
      </div>
    </div>
  )
}

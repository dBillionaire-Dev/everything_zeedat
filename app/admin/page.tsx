'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MessageSquare, Settings, FileText } from 'lucide-react'
import { api } from '@/lib/api'

export default function AdminPage() {
  const [stats, setStats] = useState({
    orders: 0,
    ordersAwaitingConfirmation: 0,
    ordersUnpaid: 0,
    customOrders: 0,
    customOrdersNew: 0,
    products: 0,
    productsNeedingAttention: 0,
  })
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
          ordersAwaitingConfirmation: ordersData.filter(o => o.status === 'RECEIVED').length,
          ordersUnpaid: ordersData.filter(o => o.payment_status !== 'PAID').length,
          customOrders: customOrdersData.length,
          customOrdersNew: customOrdersData.filter(r => r.status === 'NEW').length,
          products: productsData.length,
          productsNeedingAttention: productsData.filter(p => p.stock_status !== 'in-stock').length,
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
          <Link href="/admin/orders" className="bg-white rounded-xl p-6 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Total Orders</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.orders}</p>
                {!loading && (stats.ordersAwaitingConfirmation > 0 || stats.ordersUnpaid > 0) && (
                  <div className="mt-3 space-y-1">
                    {stats.ordersAwaitingConfirmation > 0 && (
                      <p className="text-xs font-medium text-orange-700 bg-orange-50 inline-block px-2 py-1 rounded-full mr-1">
                        {stats.ordersAwaitingConfirmation} awaiting confirmation
                      </p>
                    )}
                    {stats.ordersUnpaid > 0 && (
                      <p className="text-xs font-medium text-red-700 bg-red-50 inline-block px-2 py-1 rounded-full">
                        {stats.ordersUnpaid} unpaid
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Package className="w-12 h-12 text-[#d4a5a5] opacity-20 flex-shrink-0" />
            </div>
          </Link>

          <Link href="/admin/custom-orders" className="bg-white rounded-xl p-6 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Custom Requests</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.customOrders}</p>
                {!loading && stats.customOrdersNew > 0 && (
                  <p className="mt-3 text-xs font-medium text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded-full">
                    {stats.customOrdersNew} new
                  </p>
                )}
              </div>
              <MessageSquare className="w-12 h-12 text-[#d4a5a5] opacity-20 flex-shrink-0" />
            </div>
          </Link>

          <Link href="/admin/products" className="bg-white rounded-xl p-6 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8b8b8b] text-sm">Products</p>
                <p className="text-4xl font-bold text-[#2a2a2a] mt-2">{stats.products}</p>
                {!loading && stats.productsNeedingAttention > 0 && (
                  <p className="mt-3 text-xs font-medium text-yellow-700 bg-yellow-50 inline-block px-2 py-1 rounded-full">
                    {stats.productsNeedingAttention} low/out of stock
                  </p>
                )}
              </div>
              <Settings className="w-12 h-12 text-[#d4a5a5] opacity-20 flex-shrink-0" />
            </div>
          </Link>
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

          <Link
            href="/admin/legal-pages"
            className="bg-white rounded-xl p-8 border border-[#e8dfd9] hover:border-[#d4a5a5] transition-colors group"
          >
            <FileText className="w-8 h-8 text-[#d4a5a5] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif font-semibold text-[#2a2a2a] mb-2">Legal Pages</h3>
            <p className="text-[#8b8b8b]">Edit your Privacy Policy, Terms, and Refund Policy</p>
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

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Clock, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Order } from '@/lib/api'

const statusColors: Record<string, string> = {
  'RECEIVED': 'bg-blue-100 text-blue-800',
  'CONFIRMED': 'bg-purple-100 text-purple-800',
  'PREPARING': 'bg-yellow-100 text-yellow-800',
  'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.list()
        setOrders(data)
      } catch (error) {
        console.error('[v0] Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = selectedFilter === 'all'
    ? orders
    : orders.filter(order => order.status === selectedFilter)

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await api.orders.updateStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (error) {
      console.error('[v0] Error updating order:', error)
    }
  }

  const handleDelete = async (orderId: string) => {
    setDeletingId(orderId)
    try {
      await api.orders.remove(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error) {
      console.error('[v0] Error deleting order:', error)
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
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Orders Management</h1>
          <div />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'RECEIVED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                selectedFilter === status
                  ? 'bg-[#d4a5a5] text-white'
                  : 'bg-white text-[#2a2a2a] border border-[#e8dfd9] hover:border-[#d4a5a5]'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#8b8b8b]">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e8dfd9]">
            <p className="text-[#8b8b8b]">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e8dfd9] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e8dfd9] bg-[#f9f7f4]">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Order #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Action</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#2a2a2a]">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-[#e8dfd9] hover:bg-[#faf8f6]">
                      <td className="px-6 py-4 text-sm font-mono text-[#2a2a2a]">{order.reference}</td>
                      <td className="px-6 py-4 text-sm text-[#2a2a2a]">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-xs text-[#8b8b8b]">{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#d4a5a5]">
                        ₦{(order.total / 1000).toFixed(0)}k
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#8b8b8b]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          style={{ colorScheme: 'light' }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className="px-3 py-1 border border-[#e8dfd9] rounded text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                        >
                          <option value="RECEIVED">Received</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PREPARING">Preparing</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {confirmingId === order.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDelete(order.id)}
                              disabled={deletingId === order.id}
                              className="text-xs px-2 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {deletingId === order.id ? 'Deleting...' : 'Confirm'}
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
                            onClick={() => setConfirmingId(order.id)}
                            className="p-2 text-[#8b8b8b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Clock, Trash2, CreditCard, MessageCircle, X, Package } from 'lucide-react'
import { api } from '@/lib/api'
import type { Order, OrderItem } from '@/lib/api'

const statusColors: Record<string, string> = {
  'RECEIVED': 'bg-blue-100 text-blue-800',
  'CONFIRMED': 'bg-purple-100 text-purple-800',
  'PREPARING': 'bg-yellow-100 text-yellow-800',
  'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800',
}

const paymentColors: Record<string, string> = {
  'PENDING': 'bg-gray-100 text-gray-700',
  'PAID': 'bg-green-100 text-green-800',
  'FAILED': 'bg-red-100 text-red-800',
  'REFUNDED': 'bg-blue-100 text-blue-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [viewingOrderItems, setViewingOrderItems] = useState<OrderItem[] | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.list()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = selectedFilter === 'all'
    ? orders
    : orders.filter(order => order.status === selectedFilter)

  const updateOrder = async (orderId: string, updates: { status?: Order['status']; payment_status?: Order['payment_status'] }) => {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update order')
    return data.order as Order
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await updateOrder(orderId, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleConfirmPayment = async (orderId: string) => {
    setConfirmingPaymentId(orderId)
    try {
      const updated = await updateOrder(orderId, { payment_status: 'PAID' })
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (error) {
      console.error('Error confirming payment:', error)
    } finally {
      setConfirmingPaymentId(null)
    }
  }

  const handleMarkRefunded = async (orderId: string) => {
    setConfirmingPaymentId(orderId)
    try {
      const updated = await updateOrder(orderId, { payment_status: 'REFUNDED' })
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch (error) {
      console.error('Error marking refund issued:', error)
    } finally {
      setConfirmingPaymentId(null)
    }
  }

  const handleDelete = async (orderId: string) => {
    setDeletingId(orderId)
    try {
      await api.orders.remove(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  const handleViewOrder = async (order: Order) => {
    setViewingOrder(order)
    setViewingOrderItems(null)
    setLoadingItems(true)
    try {
      const items = await api.orders.getItems(order.id)
      setViewingOrderItems(items)
    } catch (error) {
      console.error('Error fetching order items:', error)
      setViewingOrderItems([])
    } finally {
      setLoadingItems(false)
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Payment</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#2a2a2a]">Action</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-[#2a2a2a]">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-[#e8dfd9] hover:bg-[#faf8f6]">
                      <td className="px-6 py-4 text-sm font-mono">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-[#d4a5a5] hover:text-[#c4956f] hover:underline"
                        >
                          {order.reference}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2a2a2a]">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <a
                            href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${order.customer_name}! Thank you for your order (Ref: ${order.reference}) with Gifts by EverythingZeedat 🎁. I'd like to confirm a few details and share payment options with you. 💕`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#d4a5a5] hover:text-[#c4956f] flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {order.phone}
                          </a>
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
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentColors[order.payment_status] || 'bg-gray-100'}`}>
                            {order.payment_status}
                          </span>
                          {(order.payment_status === 'PENDING' || order.payment_status === 'FAILED') && (
                            <button
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmingPaymentId === order.id}
                              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              <CreditCard className="w-3 h-3" />
                              {confirmingPaymentId === order.id ? 'Confirming...' : 'Confirm Payment'}
                            </button>
                          )}
                          {order.status === 'CANCELLED' && order.payment_status === 'PAID' && (
                            <button
                              onClick={() => handleMarkRefunded(order.id)}
                              disabled={confirmingPaymentId === order.id}
                              className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 font-medium disabled:opacity-50"
                            >
                              <CreditCard className="w-3 h-3" />
                              {confirmingPaymentId === order.id ? 'Processing...' : 'Mark Refund Issued'}
                            </button>
                          )}
                        </div>
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

      {viewingOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8"
          onClick={() => setViewingOrder(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 text-[#8b8b8b] hover:text-[#2a2a2a]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl text-[#2a2a2a] mb-1">Order Details</h3>
            <p className="font-mono text-sm text-[#d4a5a5] mb-6">{viewingOrder.reference}</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-[#8b8b8b] uppercase mb-1">Customer</p>
                <p className="font-medium text-[#2a2a2a]">{viewingOrder.customer_name}</p>
                <a
                  href={`https://wa.me/${viewingOrder.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${viewingOrder.customer_name}! Thank you for your order (Ref: ${viewingOrder.reference}) with Gifts by EverythingZeedat 🎁. I'd like to confirm a few details and share payment options with you. 💕`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#d4a5a5] hover:text-[#c4956f] flex items-center gap-1 mt-0.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {viewingOrder.phone}
                </a>
                {viewingOrder.email && (
                  <p className="text-sm text-[#8b8b8b] mt-0.5">{viewingOrder.email}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-[#8b8b8b] uppercase mb-1">Delivery Address</p>
                <p className="font-medium text-[#2a2a2a]">
                  {viewingOrder.delivery_address}, {viewingOrder.city}, {viewingOrder.state}
                </p>
                <p className="text-sm text-[#8b8b8b] mt-0.5">
                  Requested: {new Date(viewingOrder.delivery_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {viewingOrder.notes && (
              <div className="mb-6">
                <p className="text-xs text-[#8b8b8b] uppercase mb-1">Notes</p>
                <p className="text-sm text-[#2a2a2a] bg-[#f9f7f4] p-3 rounded">{viewingOrder.notes}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs text-[#8b8b8b] uppercase mb-3">Items</p>
              {loadingItems ? (
                <p className="text-sm text-[#8b8b8b]">Loading items...</p>
              ) : viewingOrderItems && viewingOrderItems.length > 0 ? (
                <div className="space-y-3">
                  {viewingOrderItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 bg-[#f9f7f4] rounded-lg p-3">
                      {item.image_snapshot ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_snapshot}
                          alt={item.name_snapshot}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-[#e8dfd9]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#e8d4d4] flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-[#d4a5a5]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#2a2a2a] text-sm truncate">{item.name_snapshot}</p>
                        <p className="text-xs text-[#8b8b8b]">
                          Qty: {item.quantity} · ₦{item.unit_price_snapshot.toLocaleString()} each
                        </p>
                        {item.customization_details && Object.keys(item.customization_details).length > 0 && (
                          <p className="text-xs text-[#8b8b8b] mt-1">
                            {Object.entries(item.customization_details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-[#d4a5a5] text-sm flex-shrink-0">
                        ₦{(item.unit_price_snapshot * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#8b8b8b]">No items found for this order.</p>
              )}
            </div>

            <div className="border-t border-[#e8dfd9] pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-[#8b8b8b]">
                <span>Subtotal</span>
                <span>₦{viewingOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#8b8b8b]">
                <span>Delivery Fee</span>
                <span>₦{viewingOrder.delivery_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#2a2a2a] text-base pt-1">
                <span>Total</span>
                <span>₦{viewingOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

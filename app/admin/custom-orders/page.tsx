'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { CustomOrderRequest } from '@/lib/api'

const statusColors: Record<string, string> = {
  'NEW': 'bg-blue-100 text-blue-800',
  'REVIEWED': 'bg-purple-100 text-purple-800',
  'QUOTED': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-green-100 text-green-800',
  'DECLINED': 'bg-red-100 text-red-800',
}

export default function AdminCustomOrdersPage() {
  const [requests, setRequests] = useState<CustomOrderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<CustomOrderRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.customOrders.list()
        setRequests(data)
      } catch (error) {
        console.error('[v0] Error fetching custom orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const handleStatusChange = async (id: string, newStatus: CustomOrderRequest['status']) => {
    try {
      const updated = await api.customOrders.update(id, { status: newStatus })
      setRequests(prev => prev.map(r => r.id === id ? updated : r))
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated)
      }
    } catch (error) {
      console.error('[v0] Error updating request:', error)
    }
  }

  const handleNotesUpdate = async (id: string, notes: string) => {
    try {
      const updated = await api.customOrders.update(id, { admin_notes: notes })
      setRequests(prev => prev.map(r => r.id === id ? updated : r))
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated)
        setAdminNotes(notes)
      }
    } catch (error) {
      console.error('[v0] Error updating notes:', error)
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
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Custom Orders</h1>
          <div />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[#8b8b8b]">Loading custom orders...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[#e8dfd9]">
                <p className="text-[#8b8b8b]">No custom order requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRequest(request)
                      setAdminNotes(request.admin_notes || '')
                    }}
                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? 'border-[#d4a5a5] bg-[#f9f7f4]'
                        : 'border-[#e8dfd9] hover:border-[#d4a5a5]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#2a2a2a]">{request.customer_name}</h3>
                        <p className="text-sm text-[#8b8b8b]">{request.occasion}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#8b8b8b] line-clamp-2">{request.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#8b8b8b]">
                      <span>{request.phone}</span>
                      <span>{request.budget_range}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 sticky top-4">
                <h3 className="font-serif font-bold text-lg text-[#2a2a2a] mb-4">Details</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Name</p>
                    <p className="font-medium text-[#2a2a2a]">{selectedRequest.customer_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Contact</p>
                    <a
                      href={`https://wa.me/${selectedRequest.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d4a5a5] hover:text-[#c4956f] flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {selectedRequest.phone}
                    </a>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Occasion</p>
                    <p className="font-medium text-[#2a2a2a]">{selectedRequest.occasion}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Budget</p>
                    <p className="font-medium text-[#2a2a2a] capitalize">{selectedRequest.budget_range.replace('-', ' - ₦')}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Status</p>
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value as CustomOrderRequest['status'])}
                      className="w-full px-3 py-2 border border-[#e8dfd9] rounded text-sm focus:outline-none focus:border-[#d4a5a5]"
                    >
                      <option value="NEW">New</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="QUOTED">Quoted</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Description</p>
                    <p className="text-sm text-[#8b8b8b] bg-[#f9f7f4] p-3 rounded">
                      {selectedRequest.description}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8b8b8b] uppercase mb-1">Admin Notes</p>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      onBlur={() => handleNotesUpdate(selectedRequest.id, adminNotes)}
                      placeholder="Add notes..."
                      rows={4}
                      className="w-full px-3 py-2 border border-[#e8dfd9] rounded text-sm focus:outline-none focus:border-[#d4a5a5] resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 text-center">
                <p className="text-[#8b8b8b]">Select a custom order request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Loader2, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { DeliveryZone, SiteSettings } from '@/lib/api'

export default function AdminDeliveryZonesPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [defaultFeeInput, setDefaultFeeInput] = useState('')
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [savingDefault, setSavingDefault] = useState(false)
  const [savedDefault, setSavedDefault] = useState(false)

  const [newState, setNewState] = useState('')
  const [newFee, setNewFee] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingFee, setEditingFee] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, zonesData] = await Promise.all([
          api.siteSettings.get(),
          api.deliveryZones.list(),
        ])
        setSettings(settingsData)
        setDefaultFeeInput(String(settingsData.default_delivery_fee))
        setZones(zonesData)
      } catch (error) {
        console.error('Error loading delivery settings:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveDefault = async () => {
    if (!settings) return
    const fee = Number(defaultFeeInput)
    if (Number.isNaN(fee) || fee < 0) return

    setSavingDefault(true)
    try {
      const updated = await api.siteSettings.setDefaultDeliveryFee(settings.id, fee)
      setSettings(updated)
      setSavedDefault(true)
      setTimeout(() => setSavedDefault(false), 3000)
    } catch (error) {
      console.error('Error saving default fee:', error)
    } finally {
      setSavingDefault(false)
    }
  }

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault()
    const fee = Number(newFee)
    if (!newState.trim() || Number.isNaN(fee) || fee < 0) return

    setAdding(true)
    try {
      const zone = await api.deliveryZones.create({ state: newState.trim(), fee })
      setZones(prev => [...prev, zone].sort((a, b) => a.state.localeCompare(b.state)))
      setNewState('')
      setNewFee('')
    } catch (error) {
      console.error('Error adding delivery zone:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleSaveZoneFee = async (zone: DeliveryZone) => {
    const fee = Number(editingFee)
    if (Number.isNaN(fee) || fee < 0) return

    setBusyId(zone.id)
    try {
      const updated = await api.deliveryZones.update(zone.id, { fee })
      setZones(prev => prev.map(z => (z.id === zone.id ? updated : z)))
      setEditingId(null)
    } catch (error) {
      console.error('Error updating delivery zone:', error)
    } finally {
      setBusyId(null)
    }
  }

  const handleDeleteZone = async (id: string) => {
    setBusyId(id)
    try {
      await api.deliveryZones.remove(id)
      setZones(prev => prev.filter(z => z.id !== id))
    } catch (error) {
      console.error('Error deleting delivery zone:', error)
    } finally {
      setBusyId(null)
      setConfirmingDeleteId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4]">
      <header className="bg-white border-b border-[#e8dfd9]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-[#d4a5a5] hover:text-[#c4956f]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-serif font-bold text-[#2a2a2a]">Delivery Pricing</h1>
          <div />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-[#8b8b8b]">Loading...</p>
        ) : (
          <>
            {/* Default fee */}
            <div className="bg-white rounded-xl border border-[#e8dfd9] p-6 mb-6">
              <h2 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-1">Default Delivery Fee</h2>
              <p className="text-sm text-[#8b8b8b] mb-4">
                Used for any state that doesn't have its own price set below.
              </p>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8b8b]">₦</span>
                  <input
                    type="number"
                    min="0"
                    value={defaultFeeInput}
                    onChange={e => setDefaultFeeInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-[#e8dfd9] rounded-lg focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                  />
                </div>
                <button
                  onClick={handleSaveDefault}
                  disabled={savingDefault}
                  className="flex items-center gap-2 bg-[#d4a5a5] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
                >
                  {savingDefault ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                {savedDefault && (
                  <span className="flex items-center gap-1 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Per-state zones */}
            <div className="bg-white rounded-xl border border-[#e8dfd9] p-6">
              <h2 className="font-serif font-semibold text-lg text-[#2a2a2a] mb-1">State-Specific Pricing</h2>
              <p className="text-sm text-[#8b8b8b] mb-4">
                Set a different delivery fee for specific states — e.g. a lower fee for states close to you, or a
                higher one for far zones. Matches whatever state the customer types at checkout (not
                case-sensitive).
              </p>

              <form onSubmit={handleAddZone} className="flex items-end gap-3 mb-6 flex-wrap">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-[#8b8b8b] mb-1">State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    placeholder="e.g. Lagos"
                    className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-[#8b8b8b] mb-1">Fee (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFee}
                    onChange={e => setNewFee(e.target.value)}
                    className="w-full px-3 py-2 border border-[#e8dfd9] rounded-lg text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-1.5 bg-[#d4a5a5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#c4956f] transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>

              {zones.length === 0 ? (
                <p className="text-sm text-[#8b8b8b]">
                  No state-specific pricing yet — every order uses the default fee above.
                </p>
              ) : (
                <div className="space-y-2">
                  {zones.map(zone => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between bg-[#f9f7f4] rounded-lg px-4 py-3"
                    >
                      <span className="font-medium text-[#2a2a2a]">{zone.state}</span>

                      {editingId === zone.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingFee}
                            onChange={e => setEditingFee(e.target.value)}
                            className="w-24 px-2 py-1 border border-[#e8dfd9] rounded text-sm focus:outline-none focus:border-[#d4a5a5] text-[#2a2a2a] bg-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveZoneFee(zone)}
                            disabled={busyId === zone.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#d4a5a5] text-white hover:bg-[#c4956f] disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs px-3 py-1.5 rounded-lg text-[#8b8b8b] hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : confirmingDeleteId === zone.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            disabled={busyId === zone.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="text-xs px-3 py-1.5 rounded-lg text-[#8b8b8b] hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#d4a5a5]">₦{zone.fee.toLocaleString()}</span>
                          <button
                            onClick={() => {
                              setEditingId(zone.id)
                              setEditingFee(String(zone.fee))
                            }}
                            className="text-xs text-[#8b8b8b] hover:text-[#2a2a2a]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(zone.id)}
                            className="p-1.5 text-[#8b8b8b] hover:text-red-600 hover:bg-white rounded transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

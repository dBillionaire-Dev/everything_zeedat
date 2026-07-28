'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { api } from './api'

export interface ActiveOrder {
  reference: string
  phone: string
  addedAt: string
}

interface ActiveOrdersContextType {
  activeOrders: ActiveOrder[]
  addActiveOrder: (reference: string, phone: string) => void
}

const ActiveOrdersContext = createContext<ActiveOrdersContextType | undefined>(undefined)

const STORAGE_KEY = 'gbez_active_orders_v1'

// Once an order reaches one of these, there's nothing left to "track" —
// the button should disappear.
const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED'])

function loadStored(): ActiveOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ActiveOrdersProvider({ children }: { children: React.ReactNode }) {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
  const hasHydrated = useRef(false)

  // Load whatever was saved, then check each one's real status. An order
  // drops off the list if it's been delivered/cancelled, or if the lookup
  // fails entirely -- which is what happens once an admin deletes it, since
  // the reference simply won't exist anymore.
  useEffect(() => {
    const stored = loadStored()
    setActiveOrders(stored)
    hasHydrated.current = true

    if (stored.length === 0) return

    let cancelled = false
    ;(async () => {
      const stillActive: ActiveOrder[] = []
      for (const order of stored) {
        try {
          const result = await api.orders.getByReference(order.reference, order.phone)
          if (!TERMINAL_STATUSES.has(result.status)) {
            stillActive.push(order)
          }
        } catch {
          // Order not found (deleted by admin) or lookup failed -- either
          // way, stop showing it as trackable.
        }
      }
      if (!cancelled) setActiveOrders(stillActive)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activeOrders))
    } catch {
      // Non-fatal.
    }
  }, [activeOrders])

  const addActiveOrder = (reference: string, phone: string) => {
    setActiveOrders(prev => {
      if (prev.some(o => o.reference === reference)) return prev
      return [...prev, { reference, phone, addedAt: new Date().toISOString() }]
    })
  }

  return (
    <ActiveOrdersContext.Provider value={{ activeOrders, addActiveOrder }}>
      {children}
    </ActiveOrdersContext.Provider>
  )
}

export function useActiveOrders() {
  const context = useContext(ActiveOrdersContext)
  if (!context) {
    throw new Error('useActiveOrders must be used within ActiveOrdersProvider')
  }
  return context
}

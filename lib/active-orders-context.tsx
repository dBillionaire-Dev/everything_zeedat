'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { api } from './api'

export type ActiveOrderType = 'order' | 'custom-order'

export interface ActiveOrder {
  type: ActiveOrderType
  reference: string
  phone: string
  addedAt: string
}

interface ActiveOrdersContextType {
  activeOrders: ActiveOrder[]
  addActiveOrder: (type: ActiveOrderType, reference: string, phone: string) => void
}

const ActiveOrdersContext = createContext<ActiveOrdersContextType | undefined>(undefined)

const STORAGE_KEY = 'gbez_active_orders_v2'

// Once an order/request reaches one of these, there's nothing left to
// "track" -- it should drop off the list.
const TERMINAL_STATUSES: Record<ActiveOrderType, Set<string>> = {
  order: new Set(['DELIVERED', 'CANCELLED']),
  'custom-order': new Set(['DELIVERED', 'DECLINED']),
}

export function trackingPath(order: Pick<ActiveOrder, 'type' | 'reference'>): string {
  return order.type === 'custom-order'
    ? `/custom-order-tracking/${order.reference}`
    : `/order-tracking/${order.reference}`
}

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

  // Load whatever was saved, then check each one's real status. An entry
  // drops off the list if it's reached a terminal status, or if the lookup
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
      for (const entry of stored) {
        try {
          const result =
            entry.type === 'custom-order'
              ? await api.customOrders.getByReference(entry.reference, entry.phone)
              : await api.orders.getByReference(entry.reference, entry.phone)

          if (!TERMINAL_STATUSES[entry.type].has(result.status)) {
            stillActive.push(entry)
          }
        } catch {
          // Not found (deleted by admin) or lookup failed -- either way,
          // stop showing it as trackable.
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

  const addActiveOrder = (type: ActiveOrderType, reference: string, phone: string) => {
    setActiveOrders(prev => {
      if (prev.some(o => o.type === type && o.reference === reference)) return prev
      return [...prev, { type, reference, phone, addedAt: new Date().toISOString() }]
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

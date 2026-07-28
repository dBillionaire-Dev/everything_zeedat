'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

export interface WishlistItem {
  productId: string
  name: string
  price: number
  slug: string
  image?: string
}

interface WishlistContextType {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  remove: (productId: string) => void
  isSaved: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'gbez_wishlist_v1'

function loadStoredWishlist(): WishlistItem[] {
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

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const hasHydrated = useRef(false)

  useEffect(() => {
    setItems(loadStoredWishlist())
    hasHydrated.current = true
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or unavailable — non-fatal.
    }
  }, [items])

  const toggle = (item: WishlistItem) => {
    setItems(prev => {
      const exists = prev.some(i => i.productId === item.productId)
      if (exists) return prev.filter(i => i.productId !== item.productId)
      return [...prev, item]
    })
  }

  const remove = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const isSaved = (productId: string) => items.some(i => i.productId === productId)

  return (
    <WishlistContext.Provider value={{ items, toggle, remove, isSaved }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}

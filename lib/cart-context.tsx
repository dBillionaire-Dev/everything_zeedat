'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
  customization?: Record<string, string>
}

export interface CartToast {
  id: number
  name: string
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: number
  toast: CartToast | null
  dismissToast: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'gbez_cart_v1'

function loadStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupted or blocked storage (e.g. private browsing) — just start fresh.
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [toast, setToast] = useState<CartToast | null>(null)
  const hasHydrated = useRef(false)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load whatever was saved from a previous visit, once, on mount.
  useEffect(() => {
    setItems(loadStoredCart())
    hasHydrated.current = true
  }, [])

  // Persist on every change, but skip the very first render before hydration
  // runs — otherwise an empty initial state would overwrite a saved cart.
  useEffect(() => {
    if (!hasHydrated.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or unavailable — the cart still works for this session,
      // it just won't survive a refresh. Not worth surfacing to the user.
    }
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })

    setToast({ id: Date.now(), name: item.name, image: item.image, quantity: item.quantity })
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500)
  }

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast(null)
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setItems(prev =>
        prev.map(i => (i.productId === productId ? { ...i, quantity } : i))
      )
    }
  }

  const clear = () => setItems([])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total, toast, dismissToast }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

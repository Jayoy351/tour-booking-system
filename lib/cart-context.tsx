"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string
  name: string
  destination: string
  tourType: string
  price: number
  image?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("tour_booking_cart")
    if (storedCart) {
      setItems(JSON.parse(storedCart))
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (isInitialized) {
      localStorage.setItem("tour_booking_cart", JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Check if item already exists
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)
  const itemCount = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

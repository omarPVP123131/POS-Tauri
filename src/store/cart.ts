import { create } from "zustand"
import type { Product } from "../lib/api"

export interface CartItem extends Product {
  quantity: number
  discount: number
  notes?: string
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateDiscount: (productId: string, discount: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id)
      if (existingItem) {
        return {
          items: state.items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        }
      }
      return { items: [...state.items, { ...product, quantity: 1, discount: 0 }] }
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === productId ? { ...item, quantity } : item)),
    })),
  updateDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === productId ? { ...item, discount } : item)),
    })),
  clearCart: () => set({ items: [] }),
  getSubtotal: () => {
    const items = get().items
    return items.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0)
  },
  getTaxAmount: () => {
    const subtotal = get().getSubtotal()
    return subtotal * 0.16 // 16% IVA
  },
  getTotal: () => {
    return get().getSubtotal() + get().getTaxAmount()
  },
}))

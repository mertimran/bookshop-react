import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Book } from '@bookshop/shared/api'

interface CartItem {
  book: Book
  quantity: number
}

interface CartStore {
  items: CartItem[]
  add: (book: Book, qty?: number) => void
  remove: (bookId: string) => void
  setQuantity: (bookId: string, qty: number) => void
  clear: () => void
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      add: (book, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.book.ID === book.ID)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.book.ID === book.ID ? { ...i, quantity: i.quantity + qty } : i,
              ),
            }
          }
          return { items: [...state.items, { book, quantity: qty }] }
        }),
      remove: (bookId) =>
        set((state) => ({ items: state.items.filter((i) => i.book.ID !== bookId) })),
      setQuantity: (bookId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.book.ID !== bookId) }
          }
          return {
            items: state.items.map((i) =>
              i.book.ID === bookId ? { ...i, quantity: qty } : i,
            ),
          }
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bookshop-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items — actions are recreated each load.
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
)

// Imperative helpers for callers outside React (e.g. flyToCart click handlers
// where pulling in the hook would force a re-render path).
export const addToCart = (book: Book, qty?: number) =>
  useCartStore.getState().add(book, qty)
export const removeFromCart = (bookId: string) =>
  useCartStore.getState().remove(bookId)
export const setCartQuantity = (bookId: string, qty: number) =>
  useCartStore.getState().setQuantity(bookId, qty)
export const clearCart = () => useCartStore.getState().clear()

// React hook — keeps the existing shape so call sites don't change. Derived
// totals are recomputed each render; with selectors below, the store only
// triggers a re-render when items actually change.
export function useCart() {
  const items = useCartStore((s) => s.items)
  const add = useCartStore((s) => s.add)
  const remove = useCartStore((s) => s.remove)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const clear = useCartStore((s) => s.clear)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + (i.book.price ?? 0) * i.quantity, 0)
  return { items, totalItems, totalAmount, add, remove, setQuantity, clear }
}

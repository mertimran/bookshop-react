import { useSyncExternalStore, useCallback } from 'react'
import type { Book } from '@bookshop/shared/api'

interface CartItem {
  book: Book
  quantity: number
}

let items: CartItem[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

function getSnapshot() {
  return items
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function addToCart(book: Book, qty = 1) {
  const existing = items.find((i) => i.book.ID === book.ID)
  if (existing) {
    items = items.map((i) =>
      i.book.ID === book.ID ? { ...i, quantity: i.quantity + qty } : i,
    )
  } else {
    items = [...items, { book, quantity: qty }]
  }
  notify()
}

export function removeFromCart(bookId: string) {
  items = items.filter((i) => i.book.ID !== bookId)
  notify()
}

export function clearCart() {
  items = []
  notify()
}

export function useCart() {
  const cartItems = useSyncExternalStore(subscribe, getSnapshot)

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = cartItems.reduce((sum, i) => sum + i.book.price * i.quantity, 0)

  return {
    items: cartItems,
    totalItems,
    totalAmount,
    add: useCallback((book: Book, qty?: number) => addToCart(book, qty), []),
    remove: useCallback((bookId: string) => removeFromCart(bookId), []),
    clear: useCallback(() => clearCart(), []),
  }
}

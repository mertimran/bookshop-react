export interface Book {
  ID: string
  title: string
  description: string
  isbn: string
  price: number
  currency_code: string
  stock: number
  publishedDate: string
  coverImageUrl: string | null
  rating: number
  authorName?: string
  author?: Author
  publisher?: Publisher
  genres?: BookGenre[]
  createdAt?: string
  modifiedAt?: string
}

export interface Author {
  ID: string
  name: string
  biography: string
  dateOfBirth: string
  books?: Book[]
}

export interface Genre {
  ID: number
  name: string
  descr: string
}

export interface BookGenre {
  ID: string
  genre?: Genre
}

export interface Publisher {
  ID: string
  name: string
  address: string
  website: string
}

export interface Order {
  ID: string
  orderNo: string
  orderDate: string
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  currency_code: string
  items?: OrderItem[]
  createdAt?: string
  modifiedAt?: string
}

export interface OrderItem {
  ID: string
  book?: Book
  quantity: number
  unitPrice: number
  amount: number
}

export interface Review {
  ID: string
  book_ID: string
  reviewer: string
  rating: number
  title: string
  comment: string
  createdAt?: string
}

export interface ODataResponse<T> {
  value: T[]
  '@odata.count'?: number
}

import { getAuthHeader } from '../auth'

const BASE_CATALOG = '/api/catalog'
const BASE_ADMIN = '/api/admin'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const auth = getAuthHeader()
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
      ...init?.headers,
    },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Request failed: ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

export const catalogApi = {
  getBooks: (params = '') =>
    fetchJson<ODataResponse<Book>>(`${BASE_CATALOG}/Books${params ? '?' + params : ''}`),
  getBook: (id: string) =>
    fetchJson<Book>(`${BASE_CATALOG}/Books(${id})?$expand=author,publisher,genres($expand=genre)`),
  getAuthors: () =>
    fetchJson<ODataResponse<Author>>(`${BASE_CATALOG}/Authors`),
  getGenres: () =>
    fetchJson<ODataResponse<Genre>>(`${BASE_CATALOG}/Genres`),
  getPublishers: () =>
    fetchJson<ODataResponse<Publisher>>(`${BASE_CATALOG}/Publishers`),
  createOrder: async (order: Partial<Order>) => {
    const auth = getAuthHeader()
    const res = await fetch(`${BASE_CATALOG}/Orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(order),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Request failed: ${res.status}`)
    }
    const location = res.headers.get('location') || ''
    const match = location.match(/Orders\(([^)]+)\)/)
    const ID = match?.[1] || ''
    return { ID } as Order
  },
  submitOrder: (orderID: string) =>
    fetchJson<Order>(`${BASE_CATALOG}/submitOrder`, {
      method: 'POST',
      body: JSON.stringify({ orderID }),
    }),
  getOrders: (params = '') =>
    fetchJson<ODataResponse<Order>>(`${BASE_CATALOG}/Orders${params ? '?' + params : ''}`),
  getReviews: (params = '') =>
    fetchJson<ODataResponse<Review>>(`${BASE_CATALOG}/Reviews${params ? '?' + params : ''}`),
  addReview: (review: Pick<Review, 'book_ID' | 'reviewer' | 'rating' | 'title' | 'comment'>) =>
    fetchJson<Review>(`${BASE_CATALOG}/Reviews`, {
      method: 'POST',
      body: JSON.stringify(review),
    }),
}

export const adminApi = {
  getBooks: (params = '') =>
    fetchJson<ODataResponse<Book>>(`${BASE_ADMIN}/Books${params ? '?' + params : ''}`),
  getBook: (id: string) =>
    fetchJson<Book>(`${BASE_ADMIN}/Books(${id})?$expand=author,publisher,genres($expand=genre)`),
  createBook: (book: Partial<Book>) =>
    fetchJson<Book>(`${BASE_ADMIN}/Books`, { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (id: string, book: Partial<Book>) =>
    fetchJson<Book>(`${BASE_ADMIN}/Books(${id})`, { method: 'PATCH', body: JSON.stringify(book) }),
  deleteBook: (id: string) => fetchAuthed(`${BASE_ADMIN}/Books(${id})`, { method: 'DELETE' }),

  getOrders: (params = '') =>
    fetchJson<ODataResponse<Order>>(`${BASE_ADMIN}/Orders${params ? '?' + params : ''}`),
  getOrder: (id: string) =>
    fetchJson<Order>(`${BASE_ADMIN}/Orders(${id})?$expand=items($expand=book)`),
  confirmOrder: (orderID: string) =>
    fetchJson<Order>(`${BASE_ADMIN}/confirmOrder`, { method: 'POST', body: JSON.stringify({ orderID }) }),
  shipOrder: (orderID: string) =>
    fetchJson<Order>(`${BASE_ADMIN}/shipOrder`, { method: 'POST', body: JSON.stringify({ orderID }) }),
  cancelOrder: (orderID: string) =>
    fetchJson<Order>(`${BASE_ADMIN}/cancelOrder`, { method: 'POST', body: JSON.stringify({ orderID }) }),

  getAuthors: (params = '') =>
    fetchJson<ODataResponse<Author>>(`${BASE_ADMIN}/Authors${params ? '?' + params : ''}`),
  createAuthor: (author: Partial<Author>) =>
    fetchJson<Author>(`${BASE_ADMIN}/Authors`, { method: 'POST', body: JSON.stringify(author) }),
  updateAuthor: (id: string, author: Partial<Author>) =>
    fetchJson<Author>(`${BASE_ADMIN}/Authors(${id})`, { method: 'PATCH', body: JSON.stringify(author) }),
  deleteAuthor: (id: string) => fetchAuthed(`${BASE_ADMIN}/Authors(${id})`, { method: 'DELETE' }),

  getGenres: () =>
    fetchJson<ODataResponse<Genre>>(`${BASE_ADMIN}/Genres`),
  getPublishers: (params = '') =>
    fetchJson<ODataResponse<Publisher>>(`${BASE_ADMIN}/Publishers${params ? '?' + params : ''}`),
  createPublisher: (pub: Partial<Publisher>) =>
    fetchJson<Publisher>(`${BASE_ADMIN}/Publishers`, { method: 'POST', body: JSON.stringify(pub) }),
  updatePublisher: (id: string, pub: Partial<Publisher>) =>
    fetchJson<Publisher>(`${BASE_ADMIN}/Publishers(${id})`, { method: 'PATCH', body: JSON.stringify(pub) }),
  deletePublisher: (id: string) => fetchAuthed(`${BASE_ADMIN}/Publishers(${id})`, { method: 'DELETE' }),
}

function fetchAuthed(url: string, init: RequestInit) {
  const auth = getAuthHeader()
  return fetch(url, {
    ...init,
    headers: { ...(auth ? { Authorization: auth } : {}), ...init.headers },
  })
}

import {
  Book as CdsBook,
  Author as CdsAuthor,
  Genre,
  Publisher,
  Order,
  OrderItem,
  OrderStatusEvent,
  Review,
  Shipment,
  Books,
} from '#cds-models/CatalogService'
import { getAuthHeader } from '../auth'

// cds-typer scopes `genre: Association to Genres` (declared in Books.Genres)
// to the local `Books.Genre` namespace member, which has no `name` field.
// Fix it to point at the top-level Genre entity.
export type BookGenre = Omit<InstanceType<typeof Books.Genre>, 'genre'> & {
  genre?: Genre | null
}

// cds-typer encodes Date as a template literal like `${n}${n}${n}${n}-...`,
// which TS won't narrow plain strings to. Loosen to string for form inputs.
export type Book = Omit<CdsBook, 'genres' | 'publishedDate'> & {
  genres?: BookGenre[] | null
  publishedDate?: string | null
}

export type Author = Omit<CdsAuthor, 'dateOfBirth'> & {
  dateOfBirth?: string | null
}

export type { Genre, Publisher, Order, OrderItem, OrderStatusEvent, Review, Shipment }

export interface ODataResponse<T> {
  value: T[]
  '@odata.count'?: number
}

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
  seedDemoOrder: () =>
    fetchJson<Order>(`${BASE_CATALOG}/seedDemoOrder`, { method: 'POST', body: '{}' }),
  getOrders: (params = '') =>
    fetchJson<ODataResponse<Order>>(`${BASE_CATALOG}/Orders${params ? '?' + params : ''}`),
  getOrder: (id: string) =>
    fetchJson<Order>(
      `${BASE_CATALOG}/Orders(${id})?$expand=items($expand=book),statusEvents,shipment`,
    ),
  getShipmentForOrder: (orderID: string) =>
    fetchJson<ODataResponse<Shipment>>(
      `${BASE_CATALOG}/Shipments?$filter=order_ID eq ${orderID}&$top=1`,
    ).then((r) => r.value[0] ?? null),
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
    fetchJson<Order>(`${BASE_ADMIN}/Orders(${id})?$expand=items($expand=book),statusEvents,shipment`),
  getShipments: (params = '') =>
    fetchJson<ODataResponse<Shipment>>(`${BASE_ADMIN}/Shipments${params ? '?' + params : ''}`),
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

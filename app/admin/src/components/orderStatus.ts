import type { Order as CdsOrder } from '#cds-models/CatalogService'

// Single source of truth for the status state machine — sourced from the CDS
// schema. Dropping `cancelled` from db/schema.cds would leave the records
// below unassigned and break the build until they're cleaned up.
export type OrderStatus = NonNullable<CdsOrder['status']>

export const STATUS_COLOR: Record<
  OrderStatus,
  'default' | 'info' | 'primary' | 'warning' | 'success' | 'error'
> = {
  draft: 'default',
  submitted: 'info',
  confirmed: 'primary',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'error',
}

export const STATUS_HEX: Record<OrderStatus, string> = {
  draft: '#9e9e9e',
  submitted: '#0288d1',
  confirmed: '#1A7B6E',
  shipped: '#E89C20',
  delivered: '#2e7d32',
  cancelled: '#d32f2f',
}

export const STATUS_ORDER: OrderStatus[] = [
  'draft',
  'submitted',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

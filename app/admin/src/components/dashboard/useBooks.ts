import { useEffect, useState } from 'react'
import { adminApi, type Book } from '@bookshop/shared/api'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    adminApi
      .getBooks('$select=ID,title,stock,price&$orderby=stock')
      .then((r) => { if (alive) setBooks(r.value) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])
  return { books, loading }
}

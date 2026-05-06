import { createFileRoute } from '@tanstack/react-router'
import {
  Typography,
  Grid,
  Box,
  Container,
  Pagination,
  Skeleton,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { catalogApi, type Book, type Genre } from '@bookshop/shared/api'
import { BookFilters } from '../../components/book-list/BookFilters'
import { BookCard } from '../../components/book-list/BookCard'

export const Route = createFileRoute('/books/')({
  component: BooksPage,
})

const PAGE_SIZE = 8

function BooksPage() {
  const { t } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState('title')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    catalogApi.getGenres().then((r) => setGenres(r.value))
  }, [])

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(1)
  }, [search, sortBy, genreFilter])

  useEffect(() => {
    setLoading(true)
    const filters: string[] = []
    if (search) {
      filters.push(`contains(tolower(title),tolower('${search.replace(/'/g, "''")}'))`)
    }
    if (genreFilter !== '') {
      filters.push(`genres/any(g:g/genre_ID eq ${genreFilter})`)
    }
    const params = [
      `$orderby=${sortBy}`,
      '$expand=genres($expand=genre)',
      '$count=true',
      `$top=${PAGE_SIZE}`,
      `$skip=${(page - 1) * PAGE_SIZE}`,
    ]
    if (filters.length) params.push(`$filter=${filters.join(' and ')}`)
    catalogApi
      .getBooks(params.join('&'))
      .then((r) => {
        setBooks(r.value)
        setTotalCount(r['@odata.count'] ?? r.value.length)
      })
      .finally(() => setLoading(false))
  }, [search, sortBy, genreFilter, page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        {t('books')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('browseCollection')}
      </Typography>

      <BookFilters
        search={search}
        onSearchChange={setSearch}
        genreFilter={genreFilter}
        onGenreChange={setGenreFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        genres={genres}
      />

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">{t('noResults')}</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.ID}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

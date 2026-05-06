import { createFileRoute } from '@tanstack/react-router'
import { Grid, Container, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { catalogApi, type Book } from '@bookshop/shared/api'
import { Hero } from '../components/home/Hero'
import { FeaturedBookCard } from '../components/home/FeaturedBookCard'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getBooks('$top=6&$orderby=rating desc')
      .then((r) => setBooks(r.value))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Hero />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.ID}>
                <FeaturedBookCard book={book} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  )
}

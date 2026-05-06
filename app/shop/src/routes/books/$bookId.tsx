import { createFileRoute } from '@tanstack/react-router'
import { Typography, Container } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { catalogApi, type Book, type Review } from '@bookshop/shared/api'
import { BookHero } from '../../components/book-detail/BookHero'
import { BookDetailSkeleton } from '../../components/book-detail/BookDetailSkeleton'
import { Recommendations } from '../../components/book-detail/Recommendations'
import { ReviewsSection } from '../../components/book-detail/ReviewsSection'

export const Route = createFileRoute('/books/$bookId')({
  component: BookDetailPage,
})

function BookDetailPage() {
  const { bookId } = Route.useParams()
  const { t } = useTranslation()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setLoading(true)
    catalogApi
      .getBook(bookId)
      .then(setBook)
      .finally(() => setLoading(false))
  }, [bookId])

  useEffect(() => {
    if (!book) return
    const genreIds = (book.genres ?? [])
      .map((bg) => bg.genre?.ID)
      .filter((id): id is number => typeof id === 'number')

    catalogApi
      .getBooks('$expand=genres($expand=genre)')
      .then((r) => {
        const candidates = r.value.filter((b) => b.ID !== book.ID)
        const ranked = genreIds.length
          ? candidates
              .map((b) => ({
                book: b,
                shared:
                  b.genres?.filter(
                    (bg) => bg.genre?.ID != null && genreIds.includes(bg.genre.ID),
                  ).length ?? 0,
              }))
              .filter((x) => x.shared > 0)
              .sort((a, b) => b.shared - a.shared)
              .map((x) => x.book)
          : candidates
        setRecommendations(ranked.slice(0, 10))
      })
      .catch(() => setRecommendations([]))
  }, [book])

  useEffect(() => {
    catalogApi
      .getReviews(`$filter=book_ID eq ${bookId}&$orderby=createdAt desc`)
      .then((r) => setReviews(r.value))
      .catch(() => setReviews([]))
  }, [bookId])

  const reload = () =>
    catalogApi
      .getReviews(`$filter=book_ID eq ${bookId}&$orderby=createdAt desc`)
      .then((r) => setReviews(r.value))

  if (loading) {
    return <BookDetailSkeleton />
  }

  if (!book) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography color="error">{t('error')}</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <BookHero book={book} />
      <Recommendations books={recommendations} />
      <ReviewsSection bookId={book.ID!} reviews={reviews} onReviewSubmitted={reload} />
    </Container>
  )
}

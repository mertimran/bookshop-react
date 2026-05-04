import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Box,
  Chip,
  Rating,
  Container,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { catalogApi, type Book } from '@bookshop/shared/api'
import { addToCart } from '../cart'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #1A7B6E 0%, #2A9D8F 100%)',
  'linear-gradient(135deg, #E89C20 0%, #F5C565 100%)',
  'linear-gradient(135deg, #145F55 0%, #1A7B6E 100%)',
  'linear-gradient(135deg, #C47F0A 0%, #E89C20 100%)',
  'linear-gradient(135deg, #2A9D8F 0%, #B8D4C0 100%)',
  'linear-gradient(135deg, #1A7B6E 0%, #E89C20 100%)',
]

function BookCard({ book, index }: { book: Book; index: number }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          background: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 800,
            fontSize: '4rem',
            lineHeight: 1,
          }}
        >
          {book.title.charAt(0)}
        </Typography>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {book.authorName || book.author?.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating
            value={book.rating}
            precision={0.1}
            size="small"
            readOnly
            sx={{ color: 'secondary.main' }}
          />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {book.rating}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            ${book.price}
          </Typography>
          <Chip
            label={book.stock > 0 ? t('inStock') : t('outOfStock')}
            color={book.stock > 0 ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2.5, justifyContent: 'space-between' }}>
        <Button
          component={Link}
          to="/books/$bookId"
          params={{ bookId: book.ID }}
          size="small"
        >
          {t('viewDetails')}
        </Button>
        <IconButton
          color="primary"
          disabled={book.stock < 1}
          onClick={() => addToCart(book)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
          size="small"
        >
          <AddShoppingCartIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  )
}

function HomePage() {
  const { t } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    catalogApi
      .getBooks('$top=6&$orderby=rating desc')
      .then((r) => setBooks(r.value))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}
          >
            {t('featuredBooks')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={400}
            sx={{ maxWidth: 480, mx: 'auto' }}
          >
            {t('browseCollection')}
          </Typography>
          <Button
            component={Link}
            to="/books"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 4 }}
          >
            {t('books')}
          </Button>
        </Container>
      </Box>

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
            {books.map((book, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.ID}>
                <BookCard book={book} index={i} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  )
}

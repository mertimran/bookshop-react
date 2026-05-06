import { Link } from '@tanstack/react-router'
import {
  Typography,
  Box,
  Button,
  Chip,
  Rating,
  Paper,
  Divider,
  Grid,
  alpha,
  useTheme,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useTranslation } from 'react-i18next'
import { type Book } from '@bookshop/shared/api'
import { BookCover } from '@bookshop/shared/components'
import { addToCart } from '../../cart'
import { flyToCart } from '../../flyToCart'

export function BookHero({ book }: { book: Book }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      <Button
        component={Link}
        to="/books"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        {t('backToBooks')}
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, border: 1, borderColor: 'divider' }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <BookCover url={book.coverImageUrl} title={book.title} height={380} fontSize="6rem" />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
              {book.title}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={400}
              sx={{ mb: 2 }}
            >
              {book.author?.name || book.authorName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Rating
                value={book.rating}
                precision={0.1}
                readOnly
                sx={{ color: 'secondary.main' }}
              />
              {(book.rating ?? 0) > 0 ? (
                <Typography variant="body1" fontWeight={600}>
                  ({book.rating})
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('noRatings')}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {book.genres?.map((bg) => (
                <Chip
                  key={bg.ID}
                  label={bg.genre?.name}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="body1"
              sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 3 }}
            >
              {book.description}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('price')}
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={800}>
                  ${book.price}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('inStock')}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={(book.stock ?? 0) > 0 ? `${book.stock} ${t('inStock')}` : t('outOfStock')}
                    color={(book.stock ?? 0) > 0 ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('isbn')}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.isbn}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textTransform="uppercase"
                  fontWeight={600}
                >
                  {t('publishedDate')}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {book.publishedDate}
                </Typography>
              </Grid>
            </Grid>

            {book.publisher && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('publisher')}: <strong>{book.publisher.name}</strong>
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={(book.stock ?? 0) < 1}
              onClick={(e) => {
                flyToCart(e.currentTarget, book.coverImageUrl)
                addToCart(book)
              }}
              sx={{ px: 4 }}
            >
              {t('addToCart')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}

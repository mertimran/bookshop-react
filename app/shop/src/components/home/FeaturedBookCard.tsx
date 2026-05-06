import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Rating,
  alpha,
  useTheme,
} from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useTranslation } from 'react-i18next'
import type { Book } from '@bookshop/shared/api'
import { BookCover } from '@bookshop/shared/components'
import { addToCart } from '../../cart'
import { flyToCart } from '../../flyToCart'

export function FeaturedBookCard({ book }: { book: Book }) {
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
      <BookCover
        url={book.coverImageUrl}
        title={book.title}
        height={200}
        fontSize="4rem"
        borderRadius={0}
      />

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
            label={(book.stock ?? 0) > 0 ? t('inStock') : t('outOfStock')}
            color={(book.stock ?? 0) > 0 ? 'success' : 'error'}
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
          params={{ bookId: String(book.ID) } as any}
          size="small"
        >
          {t('viewDetails')}
        </Button>
        <IconButton
          color="primary"
          disabled={(book.stock ?? 0) < 1}
          onClick={(e) => {
            flyToCart(e.currentTarget, book.coverImageUrl)
            addToCart(book)
          }}
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

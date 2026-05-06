import { Link } from '@tanstack/react-router'
import {
  Typography,
  Box,
  Button,
  Rating,
  Card,
  CardContent,
  CardActions,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useTranslation } from 'react-i18next'
import { type Book } from '@bookshop/shared/api'
import { BookCover } from '@bookshop/shared/components'
import { addToCart } from '../../cart'
import { flyToCart } from '../../flyToCart'

export function RecommendationCard({ book }: { book: Book }) {
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
          transform: 'translateY(-4px)',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
        },
      }}
    >
      <BookCover
        url={book.coverImageUrl}
        title={book.title}
        height={140}
        fontSize="3rem"
        borderRadius={0}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
          {book.authorName || book.author?.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Rating
            value={book.rating}
            precision={0.1}
            size="small"
            readOnly
            sx={{ color: 'secondary.main' }}
          />
        </Box>
        <Typography variant="h6" color="primary.main" fontWeight={800}>
          ${book.price}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
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

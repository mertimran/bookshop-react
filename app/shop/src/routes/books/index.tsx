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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  InputAdornment,
  Container,
  alpha,
  useTheme,
  Skeleton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { catalogApi, type Book, type Genre } from '@bookshop/shared/api'
import { addToCart } from '../../cart'

export const Route = createFileRoute('/books/')({
  component: BooksPage,
})

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #1A7B6E 0%, #2A9D8F 100%)',
  'linear-gradient(135deg, #E89C20 0%, #F5C565 100%)',
  'linear-gradient(135deg, #145F55 0%, #1A7B6E 100%)',
  'linear-gradient(135deg, #C47F0A 0%, #E89C20 100%)',
  'linear-gradient(135deg, #2A9D8F 0%, #B8D4C0 100%)',
  'linear-gradient(135deg, #1A7B6E 0%, #E89C20 100%)',
]

function BooksPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [books, setBooks] = useState<Book[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState('title')

  useEffect(() => {
    catalogApi.getGenres().then((r) => setGenres(r.value))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: string[] = [`$orderby=${sortBy}`, '$expand=genres($expand=genre)']
    if (search) {
      params.push(`$filter=contains(tolower(title),tolower('${search}'))`)
    }
    catalogApi
      .getBooks(params.join('&'))
      .then((r) => {
        let result = r.value
        if (genreFilter !== '') {
          result = result.filter((b) =>
            b.genres?.some((bg) => bg.genre?.ID === genreFilter),
          )
        }
        setBooks(result)
      })
      .finally(() => setLoading(false))
  }, [search, sortBy, genreFilter])

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        {t('books')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('browseCollection')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
          p: 2.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: 1,
          borderColor: 'divider',
        }}
      >
        <TextField
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 250, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('genre')}</InputLabel>
          <Select
            value={genreFilter}
            label={t('genre')}
            onChange={(e) => setGenreFilter(e.target.value as number | '')}
          >
            <MenuItem value="">{t('allGenres')}</MenuItem>
            {genres.map((g) => (
              <MenuItem key={g.ID} value={g.ID}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>{t('sortBy')}</InputLabel>
          <Select value={sortBy} label={t('sortBy')} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="title">{t('title')}</MenuItem>
            <MenuItem value="price">{t('price')}</MenuItem>
            <MenuItem value="rating desc">{t('rating')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={360} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : books.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">{t('noResults')}</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {books.map((book, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={book.ID}>
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
                    height: 160,
                    background: COVER_GRADIENTS[i % COVER_GRADIENTS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '3.5rem' }}>
                    {book.title.charAt(0)}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {book.authorName || book.author?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                    <Rating value={book.rating} precision={0.1} size="small" readOnly sx={{ color: 'secondary.main' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" fontWeight={800}>
                      ${book.price}
                    </Typography>
                    <Chip
                      label={book.stock > 0 ? t('inStock') : t('outOfStock')}
                      color={book.stock > 0 ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
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
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

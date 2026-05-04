import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Book, type Author, type Publisher } from '@bookshop/shared/api'

export const Route = createFileRoute('/books/$bookId')({
  component: EditBookPage,
})

function EditBookPage() {
  const { bookId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [book, setBook] = useState<Partial<Book>>({})
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      adminApi.getBook(bookId),
      adminApi.getAuthors(),
      adminApi.getPublishers(),
    ])
      .then(([b, a, p]) => {
        setBook(b)
        setAuthors(a.value)
        setPublishers(p.value)
      })
      .finally(() => setLoading(false))
  }, [bookId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateBook(bookId, {
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        price: book.price,
        stock: book.stock,
        rating: book.rating,
        publishedDate: book.publishedDate,
        coverImageUrl: book.coverImageUrl,
        author_ID: (book as any).author_ID,
        publisher_ID: (book as any).publisher_ID,
      } as any)
      navigate({ to: '/books' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Skeleton width={120} height={40} sx={{ mb: 2 }} />
        <Skeleton width={200} height={48} sx={{ mb: 4 }} />
        <Skeleton variant="rounded" height={500} sx={{ borderRadius: 4 }} />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => navigate({ to: '/books' })}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        {t('books')}
      </Button>

      <Typography variant="h2" sx={{ mb: 4 }}>{t('editBook')}</Typography>

      <Paper sx={{ p: { xs: 3, md: 4 }, border: 1, borderColor: 'divider' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('title')}
              value={book.title || ''}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('isbn')}
              value={book.isbn || ''}
              onChange={(e) => setBook({ ...book, isbn: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('description')}
              value={book.description || ''}
              onChange={(e) => setBook({ ...book, description: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={t('price')}
              value={book.price || ''}
              onChange={(e) => setBook({ ...book, price: parseFloat(e.target.value) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={t('stock')}
              value={book.stock ?? ''}
              onChange={(e) => setBook({ ...book, stock: parseInt(e.target.value) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={t('rating')}
              value={book.rating || ''}
              onChange={(e) => setBook({ ...book, rating: parseFloat(e.target.value) })}
              slotProps={{ htmlInput: { min: 0, max: 5, step: 0.1 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('author')}</InputLabel>
              <Select
                value={(book as any).author_ID || book.author?.ID || ''}
                label={t('author')}
                onChange={(e) => setBook({ ...book, author_ID: e.target.value } as any)}
              >
                {authors.map((a) => (
                  <MenuItem key={a.ID} value={a.ID}>{a.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('publisher')}</InputLabel>
              <Select
                value={(book as any).publisher_ID || book.publisher?.ID || ''}
                label={t('publisher')}
                onChange={(e) => setBook({ ...book, publisher_ID: e.target.value } as any)}
              >
                {publishers.map((p) => (
                  <MenuItem key={p.ID} value={p.ID}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label={t('publishedDate')}
              value={book.publishedDate || ''}
              onChange={(e) => setBook({ ...book, publishedDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('coverImage')}
              value={book.coverImageUrl || ''}
              onChange={(e) => setBook({ ...book, coverImageUrl: e.target.value })}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate({ to: '/books' })} variant="outlined">
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}>
            {saving ? t('loading') : t('save')}
          </Button>
        </Box>
      </Paper>
    </>
  )
}

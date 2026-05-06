import {
  Button,
  Skeleton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import type { Book, Author, Publisher } from '@bookshop/shared/api'
import { EntityDrawer } from '../EntityDrawer'

export interface BookForm extends Partial<Book> {
  author_ID?: string
  publisher_ID?: string
}

export function BookEditor({
  open,
  form,
  setForm,
  authors,
  publishers,
  loading,
  saving,
  error,
  onClose,
  onSave,
  onRequestDelete,
}: {
  open: boolean
  form: BookForm
  setForm: (form: BookForm) => void
  authors: Author[]
  publishers: Publisher[]
  loading: boolean
  saving: boolean
  error: string
  onClose: () => void
  onSave: () => void
  onRequestDelete: () => void
}) {
  const { t } = useTranslation()

  return (
    <EntityDrawer
      open={open}
      title={form.title || t('editBook')}
      subtitle={form.isbn}
      onClose={onClose}
      width={560}
      actions={
        <>
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={onRequestDelete}
            sx={{ mr: 'auto' }}
          >
            {t('delete')}
          </Button>
          <Button onClick={onClose} variant="outlined">
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={saving || loading}
          >
            {saving ? t('loading') : t('save')}
          </Button>
        </>
      }
    >
      {loading ? (
        <>
          <Skeleton variant="rounded" height={56} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rounded" height={56} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ mb: 2, borderRadius: 1 }} />
        </>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('title')}
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('isbn')}
                value={form.isbn || ''}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('description')}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label={t('price')}
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label={t('stock')}
                value={form.stock ?? ''}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>{t('author')}</InputLabel>
                <Select
                  value={form.author_ID || ''}
                  label={t('author')}
                  onChange={(e) => setForm({ ...form, author_ID: e.target.value })}
                >
                  {authors.map((a) => (
                    <MenuItem key={a.ID} value={a.ID}>
                      {a.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>{t('publisher')}</InputLabel>
                <Select
                  value={form.publisher_ID || ''}
                  label={t('publisher')}
                  onChange={(e) => setForm({ ...form, publisher_ID: e.target.value })}
                >
                  {publishers.map((p) => (
                    <MenuItem key={p.ID} value={p.ID}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="date"
                label={t('publishedDate')}
                value={form.publishedDate || ''}
                onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={t('coverImage')}
                value={form.coverImageUrl || ''}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              />
            </Grid>
          </Grid>
        </>
      )}
    </EntityDrawer>
  )
}

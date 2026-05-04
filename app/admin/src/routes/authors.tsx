import { createFileRoute } from '@tanstack/react-router'
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Author } from '@bookshop/shared/api'

export const Route = createFileRoute('/authors')({
  component: AuthorsPage,
})

function AuthorsPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [editAuthor, setEditAuthor] = useState<Partial<Author> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadAuthors = () => {
    setLoading(true)
    adminApi.getAuthors().then((r) => setAuthors(r.value)).finally(() => setLoading(false))
  }

  useEffect(loadAuthors, [])

  const handleSave = async () => {
    if (!editAuthor) return
    setSaving(true)
    try {
      if (editAuthor.ID) {
        await adminApi.updateAuthor(editAuthor.ID, editAuthor)
      } else {
        await adminApi.createAuthor(editAuthor)
      }
      setEditAuthor(null)
      loadAuthors()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deleteAuthor(deleteId)
    setDeleteId(null)
    loadAuthors()
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">{t('authors')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {authors.length} total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditAuthor({ name: '', biography: '', dateOfBirth: '' })}
        >
          {t('create')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('dateOfBirth')}</TableCell>
                <TableCell>{t('biography')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontWeight={600}>{author.name}</Typography>
                  </TableCell>
                  <TableCell>{author.dateOfBirth}</TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 300 }} color="text.secondary">
                      {author.biography}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditAuthor(author)} sx={{ color: 'primary.main' }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(author.ID)}
                      sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!editAuthor} onClose={() => setEditAuthor(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>{editAuthor?.ID ? t('edit') : t('create')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                required
                label={t('name')}
                value={editAuthor?.name || ''}
                onChange={(e) => setEditAuthor({ ...editAuthor, name: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                type="date"
                label={t('dateOfBirth')}
                value={editAuthor?.dateOfBirth || ''}
                onChange={(e) => setEditAuthor({ ...editAuthor, dateOfBirth: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('biography')}
                value={editAuthor?.biography || ''}
                onChange={(e) => setEditAuthor({ ...editAuthor, biography: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditAuthor(null)} variant="outlined">{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? t('loading') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>{t('delete')}</DialogTitle>
        <DialogContent>{t('deleteConfirm')}</DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

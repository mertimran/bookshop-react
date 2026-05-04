import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Book } from '@bookshop/shared/api'

export const Route = createFileRoute('/books/')({
  component: BooksManagePage,
})

function BooksManagePage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadBooks = () => {
    setLoading(true)
    adminApi
      .getBooks('$expand=author,publisher')
      .then((r) => setBooks(r.value))
      .finally(() => setLoading(false))
  }

  useEffect(loadBooks, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deleteBook(deleteId)
    setDeleteId(null)
    loadBooks()
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">{t('books')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {books.length} total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/books/new"
        >
          {t('newBook')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('title')}</TableCell>
                <TableCell>{t('author')}</TableCell>
                <TableCell>{t('publisher')}</TableCell>
                <TableCell align="right">{t('price')}</TableCell>
                <TableCell align="right">{t('stock')}</TableCell>
                <TableCell align="right">{t('rating')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontWeight={600}>{book.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{book.isbn}</Typography>
                  </TableCell>
                  <TableCell>{book.author?.name}</TableCell>
                  <TableCell>{book.publisher?.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>${book.price}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={book.stock}
                      color={book.stock < 10 ? 'error' : book.stock < 50 ? 'warning' : 'success'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{book.rating}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      to="/books/$bookId"
                      params={{ bookId: book.ID }}
                      size="small"
                      sx={{ color: 'primary.main' }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(book.ID)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                      }}
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

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>{t('delete')}</DialogTitle>
        <DialogContent>{t('deleteConfirm')}</DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

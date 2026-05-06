import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Book } from '@bookshop/shared/api'

export function BooksTable({
  books,
  selectedId,
  onSelect,
}: {
  books: Book[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow
              key={book.ID}
              hover
              onClick={() => onSelect(book.ID!)}
              selected={selectedId === book.ID}
              sx={{
                cursor: 'pointer',
                '&:last-child td': { border: 0 },
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <TableCell>
                <Typography fontWeight={600}>{book.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {book.isbn}
                </Typography>
              </TableCell>
              <TableCell>{book.author?.name}</TableCell>
              <TableCell>{book.publisher?.name}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                ${book.price}
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={book.stock ?? 0}
                  color={(book.stock ?? 0) < 10 ? 'error' : (book.stock ?? 0) < 50 ? 'warning' : 'success'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">{book.rating}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

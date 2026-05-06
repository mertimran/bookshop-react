import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Author } from '@bookshop/shared/api'

export function AuthorsTable({
  authors,
  selectedId,
  onSelect,
}: {
  authors: Author[]
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
            <TableCell>{t('name')}</TableCell>
            <TableCell>{t('dateOfBirth')}</TableCell>
            <TableCell>{t('biography')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {authors.map((author) => (
            <TableRow
              key={author.ID}
              hover
              onClick={() => onSelect(author.ID!)}
              selected={selectedId === author.ID}
              sx={{
                cursor: 'pointer',
                '&:last-child td': { border: 0 },
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <TableCell>
                <Typography fontWeight={600}>{author.name}</Typography>
              </TableCell>
              <TableCell>{author.dateOfBirth}</TableCell>
              <TableCell>
                <Typography noWrap sx={{ maxWidth: 400 }} color="text.secondary">
                  {author.biography}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

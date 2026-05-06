import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MuiLink,
  alpha,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { Publisher } from '@bookshop/shared/api'

export function PublishersTable({
  publishers,
  selectedId,
  onSelect,
}: {
  publishers: Publisher[]
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
            <TableCell>{t('address')}</TableCell>
            <TableCell>{t('website')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {publishers.map((pub) => (
            <TableRow
              key={pub.ID}
              hover
              onClick={() => onSelect(pub.ID!)}
              selected={selectedId === pub.ID}
              sx={{
                cursor: 'pointer',
                '&:last-child td': { border: 0 },
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              <TableCell>
                <Typography fontWeight={600}>{pub.name}</Typography>
              </TableCell>
              <TableCell>{pub.address}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {pub.website && (
                  <MuiLink
                    href={pub.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    {pub.website}
                  </MuiLink>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

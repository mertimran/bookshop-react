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
  Skeleton,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Genre } from '@bookshop/shared/api'

export const Route = createFileRoute('/genres')({
  component: GenresPage,
})

function GenresPage() {
  const { t } = useTranslation()
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getGenres().then((r) => setGenres(r.value)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Typography variant="h2" sx={{ mb: 0.5 }}>{t('genres')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {genres.length} total
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('description')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {genres.map((genre) => (
                <TableRow key={genre.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{genre.ID}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{genre.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="text.secondary">{genre.descr}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

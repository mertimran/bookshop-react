import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import type { Genre } from '@bookshop/shared/api'

export function BookFilters({
  search,
  onSearchChange,
  genreFilter,
  onGenreChange,
  sortBy,
  onSortChange,
  genres,
}: {
  search: string
  onSearchChange: (value: string) => void
  genreFilter: number | ''
  onGenreChange: (value: number | '') => void
  sortBy: string
  onSortChange: (value: string) => void
  genres: Genre[]
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
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
        onChange={(e) => onSearchChange(e.target.value)}
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
          onChange={(e) => onGenreChange(e.target.value as number | '')}
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
        <Select
          value={sortBy}
          label={t('sortBy')}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <MenuItem value="title">{t('title')}</MenuItem>
          <MenuItem value="price">{t('price')}</MenuItem>
          <MenuItem value="rating desc">{t('rating')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

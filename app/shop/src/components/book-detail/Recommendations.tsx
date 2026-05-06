import { Box, Typography, useTheme } from '@mui/material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useTranslation } from 'react-i18next'
import { type Book } from '@bookshop/shared/api'
import { RecommendationCard } from './RecommendationCard'

export function Recommendations({ books }: { books: Book[] }) {
  const { t } = useTranslation()
  const theme = useTheme()

  if (books.length === 0) return null

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        {t('youMightAlsoLike')}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          px: { xs: 0, sm: 6 },
          '& .swiper-button-prev, & .swiper-button-next': {
            color: theme.palette.primary.main,
            width: 30,
            height: 40,
            top: '50%',
            marginTop: 0,
            transform: 'translateY(-50%)',
          },
          '& .swiper-button-prev': { left: 0 },
          '& .swiper-button-next': { right: 0 },
          '& .swiper-button-prev::after, & .swiper-button-next::after': {
            fontSize: 18,
            fontWeight: 700,
          },
          '& .swiper-button-disabled': { opacity: 0.3 },
          '& .swiper-pagination-bullet-active': {
            backgroundColor: theme.palette.primary.main,
          },
        }}
      >
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          style={{ paddingBottom: 40 }}
        >
          {books.map((rec) => (
            <SwiperSlide key={rec.ID} style={{ height: 'auto' }}>
              <RecommendationCard book={rec} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  )
}

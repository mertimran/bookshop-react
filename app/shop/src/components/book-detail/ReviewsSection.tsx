import { Link } from '@tanstack/react-router'
import { Box, Typography, Paper, Stack, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { type Review } from '@bookshop/shared/api'
import { useAuth } from '@bookshop/shared/auth'
import { ReviewForm } from './ReviewForm'
import { ReviewItem } from './ReviewItem'

export function ReviewsSection({
  bookId,
  reviews,
  onReviewSubmitted,
}: {
  bookId: string
  reviews: Review[]
  onReviewSubmitted: () => void
}) {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        {t('reviews')}{' '}
        {reviews.length > 0 && (
          <Typography
            component="span"
            variant="h5"
            color="text.secondary"
            fontWeight={500}
          >
            ({reviews.length})
          </Typography>
        )}
      </Typography>

      {isAuthenticated && user ? (
        <ReviewForm bookId={bookId} reviewerName={user.name} onSubmitted={onReviewSubmitted} />
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography color="text.secondary">{t('signInToReview')}</Typography>
          <Button component={Link} to="/login" variant="outlined" size="small">
            {t('signIn')}
          </Button>
        </Paper>
      )}

      <Box sx={{ mt: 4 }}>
        {reviews.length === 0 ? (
          <Typography color="text.secondary">{t('noReviews')}</Typography>
        ) : (
          <Stack spacing={2}>
            {reviews.map((rev) => (
              <ReviewItem key={rev.ID} review={rev} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

import { Paper, Box, Typography, Rating, Avatar, alpha, useTheme } from '@mui/material'
import { type Review } from '@bookshop/shared/api'

export function ReviewItem({ review }: { review: Review }) {
  const theme = useTheme()
  const initial = review.reviewer?.charAt(0).toUpperCase() ?? '?'
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            fontWeight: 700,
          }}
        >
          {initial}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {review.reviewer}
            </Typography>
            <Rating
              value={review.rating}
              precision={0.5}
              size="small"
              readOnly
              sx={{ color: 'secondary.main' }}
            />
            {review.createdAt && (
              <Typography variant="caption" color="text.secondary">
                {new Date(review.createdAt).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          {review.title && (
            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
              {review.title}
            </Typography>
          )}
          {review.comment && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, lineHeight: 1.7 }}
            >
              {review.comment}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

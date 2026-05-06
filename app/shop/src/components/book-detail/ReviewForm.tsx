import { useState } from 'react'
import { Paper, Box, Typography, Stack, Rating, TextField, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { catalogApi } from '@bookshop/shared/api'

interface ReviewFormProps {
  bookId: string
  reviewerName: string
  onSubmitted: () => void
}

export function ReviewForm({ bookId, reviewerName, onSubmitted }: ReviewFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState<number | null>(5)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = rating != null && rating > 0 && !submitting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await catalogApi.addReview({
        book_ID: bookId,
        reviewer: reviewerName,
        rating: rating!,
        title: title.trim(),
        comment: comment.trim(),
      })
      setTitle('')
      setComment('')
      setRating(5)
      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        {t('writeReview')}
      </Typography>
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: 'block', mb: 0.5 }}
            >
              {t('yourRating')}
            </Typography>
            <Rating
              value={rating}
              precision={0.5}
              onChange={(_, v) => setRating(v)}
              sx={{ color: 'secondary.main' }}
            />
          </Box>
          <TextField
            label={t('reviewTitle')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label={t('yourComment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Box>
            <Button type="submit" variant="contained" disabled={!canSubmit}>
              {t('submitReview')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  )
}

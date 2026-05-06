import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material'

export function ChartCard({
  title,
  loading,
  children,
}: {
  title: string
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <Card sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

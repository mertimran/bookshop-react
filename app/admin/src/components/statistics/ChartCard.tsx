import { Card, CardContent, Typography, Skeleton } from '@mui/material'

export function ChartCard({
  title,
  subtitle,
  loading,
  children,
}: {
  title: string
  subtitle?: string
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <Card sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2, mt: 2 }} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

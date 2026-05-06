import { Container, Paper, Grid, Skeleton } from '@mui/material'

export function BookDetailSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Skeleton width={120} height={40} sx={{ mb: 3 }} />
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={350} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton width="60%" height={48} />
            <Skeleton width="30%" height={32} sx={{ mt: 1 }} />
            <Skeleton width="100%" height={120} sx={{ mt: 3 }} />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

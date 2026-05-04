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
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Link as MuiLink,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Publisher } from '@bookshop/shared/api'

export const Route = createFileRoute('/publishers')({
  component: PublishersPage,
})

function PublishersPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [editPub, setEditPub] = useState<Partial<Publisher> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadPublishers = () => {
    setLoading(true)
    adminApi.getPublishers().then((r) => setPublishers(r.value)).finally(() => setLoading(false))
  }

  useEffect(loadPublishers, [])

  const handleSave = async () => {
    if (!editPub) return
    setSaving(true)
    try {
      if (editPub.ID) {
        await adminApi.updatePublisher(editPub.ID, editPub)
      } else {
        await adminApi.createPublisher(editPub)
      }
      setEditPub(null)
      loadPublishers()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deletePublisher(deleteId)
    setDeleteId(null)
    loadPublishers()
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">{t('publishers')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {publishers.length} total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditPub({ name: '', address: '', website: '' })}
        >
          {t('create')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('address')}</TableCell>
                <TableCell>{t('website')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {publishers.map((pub) => (
                <TableRow key={pub.ID} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontWeight={600}>{pub.name}</Typography>
                  </TableCell>
                  <TableCell>{pub.address}</TableCell>
                  <TableCell>
                    {pub.website && (
                      <MuiLink href={pub.website} target="_blank" rel="noopener noreferrer" color="primary">
                        {pub.website}
                      </MuiLink>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditPub(pub)} sx={{ color: 'primary.main' }}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(pub.ID)}
                      sx={{ color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!editPub} onClose={() => setEditPub(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>{editPub?.ID ? t('edit') : t('create')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                required
                label={t('name')}
                value={editPub?.name || ''}
                onChange={(e) => setEditPub({ ...editPub, name: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('address')}
                value={editPub?.address || ''}
                onChange={(e) => setEditPub({ ...editPub, address: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={t('website')}
                value={editPub?.website || ''}
                onChange={(e) => setEditPub({ ...editPub, website: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditPub(null)} variant="outlined">{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? t('loading') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={700}>{t('delete')}</DialogTitle>
        <DialogContent>{t('deleteConfirm')}</DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)}>{t('cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>{t('delete')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function DeleteConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const { t } = useTranslation()
  return (
    <Dialog open={open} onClose={onCancel} PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle fontWeight={700}>{t('delete')}</DialogTitle>
      <DialogContent>{t('deleteConfirm')}</DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

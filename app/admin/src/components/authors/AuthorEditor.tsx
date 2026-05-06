import { Button, TextField, Grid, Alert } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import type { Author } from '@bookshop/shared/api'
import { EntityDrawer } from '../EntityDrawer'

export function AuthorEditor({
  open,
  isCreating,
  form,
  setForm,
  saving,
  error,
  onClose,
  onSave,
  onRequestDelete,
}: {
  open: boolean
  isCreating: boolean
  form: Partial<Author>
  setForm: (form: Partial<Author>) => void
  saving: boolean
  error: string
  onClose: () => void
  onSave: () => void
  onRequestDelete: () => void
}) {
  const { t } = useTranslation()

  return (
    <EntityDrawer
      open={open}
      title={isCreating ? t('create') : form.name || t('edit')}
      subtitle={!isCreating && form.dateOfBirth ? form.dateOfBirth : undefined}
      onClose={onClose}
      actions={
        <>
          {!isCreating && (
            <Button
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={onRequestDelete}
              sx={{ mr: 'auto' }}
            >
              {t('delete')}
            </Button>
          )}
          <Button onClick={onClose} variant="outlined">
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={saving || !form.name?.trim()}
          >
            {saving ? t('loading') : t('save')}
          </Button>
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            required
            label={t('name')}
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            type="date"
            label={t('dateOfBirth')}
            value={form.dateOfBirth || ''}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={5}
            label={t('biography')}
            value={form.biography || ''}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
          />
        </Grid>
      </Grid>
    </EntityDrawer>
  )
}

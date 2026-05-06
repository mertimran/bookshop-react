import { createFileRoute } from '@tanstack/react-router'
import { Typography, Button, Box, Skeleton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Publisher } from '@bookshop/shared/api'
import { PublishersTable } from '../components/publishers/PublishersTable'
import { PublisherEditor } from '../components/publishers/PublisherEditor'
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'

export const Route = createFileRoute('/publishers')({
  component: PublishersPage,
})

const NEW_ID = '__new__'

function PublishersPage() {
  const { t } = useTranslation()
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Publisher>>({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isCreating = selectedId === NEW_ID

  const loadPublishers = () => {
    setLoading(true)
    adminApi.getPublishers().then((r) => setPublishers(r.value)).finally(() => setLoading(false))
  }

  useEffect(loadPublishers, [])

  useEffect(() => {
    if (!selectedId) { setForm({}); setError(''); return }
    if (isCreating) {
      setForm({ name: '', address: '', website: '' })
      return
    }
    const found = publishers.find((p) => p.ID === selectedId)
    if (found) setForm(found)
  }, [selectedId, publishers, isCreating])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (isCreating) {
        await adminApi.createPublisher(form)
      } else if (selectedId) {
        await adminApi.updatePublisher(selectedId, form)
      }
      setSelectedId(null)
      loadPublishers()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deletePublisher(deleteId)
    if (selectedId === deleteId) setSelectedId(null)
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSelectedId(NEW_ID)}>
          {t('create')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : (
        <PublishersTable
          publishers={publishers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}

      <PublisherEditor
        open={!!selectedId}
        isCreating={isCreating}
        form={form}
        setForm={setForm}
        saving={saving}
        error={error}
        onClose={() => setSelectedId(null)}
        onSave={handleSave}
        onRequestDelete={() => selectedId && setDeleteId(selectedId)}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

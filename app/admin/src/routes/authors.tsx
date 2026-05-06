import { createFileRoute } from '@tanstack/react-router'
import { Typography, Button, Box, Skeleton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Author } from '@bookshop/shared/api'
import { AuthorsTable } from '../components/authors/AuthorsTable'
import { AuthorEditor } from '../components/authors/AuthorEditor'
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog'

export const Route = createFileRoute('/authors')({
  component: AuthorsPage,
})

const NEW_ID = '__new__'

function AuthorsPage() {
  const { t } = useTranslation()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Author>>({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const isCreating = selectedId === NEW_ID

  const loadAuthors = () => {
    setLoading(true)
    adminApi.getAuthors().then((r) => setAuthors(r.value)).finally(() => setLoading(false))
  }

  useEffect(loadAuthors, [])

  useEffect(() => {
    if (!selectedId) { setForm({}); setError(''); return }
    if (isCreating) {
      setForm({ name: '', biography: '', dateOfBirth: '' })
      return
    }
    const found = authors.find((a) => a.ID === selectedId)
    if (found) setForm(found)
  }, [selectedId, authors, isCreating])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (isCreating) {
        await adminApi.createAuthor(form)
      } else if (selectedId) {
        await adminApi.updateAuthor(selectedId, form)
      }
      setSelectedId(null)
      loadAuthors()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deleteAuthor(deleteId)
    if (selectedId === deleteId) setSelectedId(null)
    setDeleteId(null)
    loadAuthors()
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">{t('authors')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {authors.length} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSelectedId(NEW_ID)}>
          {t('create')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 4 }} />
      ) : (
        <AuthorsTable authors={authors} selectedId={selectedId} onSelect={setSelectedId} />
      )}

      <AuthorEditor
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

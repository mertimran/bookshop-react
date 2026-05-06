import { createFileRoute, Link } from '@tanstack/react-router'
import { Typography, Button, Box, Skeleton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { adminApi, type Book, type Author, type Publisher } from '@bookshop/shared/api'
import { BooksTable } from '../../components/books/BooksTable'
import { BookEditor, type BookForm } from '../../components/books/BookEditor'
import { DeleteConfirmDialog } from '../../components/DeleteConfirmDialog'

export const Route = createFileRoute('/books/')({
  component: BooksManagePage,
})

function BooksManagePage() {
  const { t } = useTranslation()
  const [books, setBooks] = useState<Book[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<BookForm>({})
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadBooks = () => {
    setLoading(true)
    adminApi
      .getBooks('$expand=author,publisher')
      .then((r) => setBooks(r.value))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBooks()
    Promise.all([adminApi.getAuthors(), adminApi.getPublishers()]).then(([a, p]) => {
      setAuthors(a.value)
      setPublishers(p.value)
    })
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setForm({})
      setError('')
      return
    }
    setDetailLoading(true)
    adminApi
      .getBook(selectedId)
      .then((b) => {
        setForm({
          ...b,
          author_ID: b.author?.ID,
          publisher_ID: b.publisher?.ID,
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    setError('')
    try {
      await adminApi.updateBook(selectedId, {
        title: form.title,
        description: form.description,
        isbn: form.isbn,
        price: form.price,
        stock: form.stock,
        publishedDate: form.publishedDate,
        coverImageUrl: form.coverImageUrl,
        author_ID: form.author_ID,
        publisher_ID: form.publisher_ID,
      } as any)
      setSelectedId(null)
      loadBooks()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await adminApi.deleteBook(deleteId)
    if (selectedId === deleteId) setSelectedId(null)
    setDeleteId(null)
    loadBooks()
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h2">{t('books')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {books.length} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/books/new">
          {t('newBook')}
        </Button>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      ) : (
        <BooksTable books={books} selectedId={selectedId} onSelect={setSelectedId} />
      )}

      <BookEditor
        open={!!selectedId}
        form={form}
        setForm={setForm}
        authors={authors}
        publishers={publishers}
        loading={detailLoading}
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

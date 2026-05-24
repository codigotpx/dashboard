import { useCallback, useEffect, useState } from 'react'
import {
  fetchCategories, createCategory, updateCategory, deleteCategory,
} from '../services/api'
import { X, Plus, Edit2, Trash2, Search } from 'lucide-react'

const Categorias = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = categories.filter(c =>
    !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCategory(editing.id, form)
      } else {
        await createCategory(form)
      }
      setShowModal(false); setEditing(null); setForm({ name: '', description: '' })
      load()
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await deleteCategory(id)
      load()
    } catch (err) { alert(err.message) }
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name || '', description: c.description || '' })
    setShowModal(true)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white">Categorías</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg px-2 py-1.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--fourth)' }} />
            <input placeholder="Buscar..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-[12px] outline-none bg-transparent w-36"
              style={{ color: '#fff' }} />
          </div>
          <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true) }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--third)', color: '#fff' }}>
            <Plus size={14} /> Nueva
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm" style={{ color: 'var(--third)' }}>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[14px] font-semibold text-white">{c.name}</h3>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => openEdit(c)}
                    className="p-1.5 rounded transition-opacity hover:opacity-80"
                    style={{ color: '#A78BFA' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded transition-opacity hover:opacity-80"
                    style={{ color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {c.description && (
                <p className="text-[12px] line-clamp-2" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                  {c.description}
                </p>
              )}
              <p className="text-[10px] mt-2" style={{ color: 'var(--fourth)', opacity: 0.4 }}>
                ID: {c.id}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>No hay categorías</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border p-6 w-full max-w-md"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--fourth)' }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold mb-1 block" style={{ color: 'var(--fourth)' }}>Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
              </div>
              <div>
                <label className="text-[11px] font-semibold mb-1 block" style={{ color: 'var(--fourth)' }}>Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-[13px] outline-none resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave}
                  className="flex-1 rounded-lg py-2 text-[13px] font-semibold"
                  style={{ background: 'var(--third)', color: '#fff' }}>
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
                <button onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-[13px]"
                  style={{ background: 'var(--surface)', color: 'var(--fourth)' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Categorias

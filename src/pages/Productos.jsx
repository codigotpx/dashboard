import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Package, Plus, X, Trash2 } from 'lucide-react'
import {
  fetchProducts,
  fetchActiveProducts,
  fetchProductsByCategory,
  fetchCategories,
  createProduct,
  updateProduct,
  setProductActive,
  deleteProduct,
} from '../services/api'

const ITEMS_PER_PAGE = 10
const EMPTY_FORM = { sku: '', name: '', description: '', price: '', categoryId: '', active: true, imageUrl: '' }

const Productos = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadProducts = useCallback(() => {
    setLoading(true)
    setError(null)

    let promise
    if (filterCategory) {
      promise = fetchProductsByCategory(filterCategory, page, ITEMS_PER_PAGE)
    } else if (filterStatus === 'active') {
      promise = fetchActiveProducts(page, ITEMS_PER_PAGE)
    } else {
      promise = fetchProducts(page, ITEMS_PER_PAGE)
    }

    promise
      .then((data) => {
        let list = data.content ?? data
        if (filterStatus === 'inactive') {
          list = list.filter((p) => !p.active)
        }
        setProducts(list)
        setTotalPages(data.totalPages ?? 1)
        setTotalElements(data.totalElements ?? list.length)
      })
      .catch((err) => setError(err.message || 'Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [filterCategory, filterStatus, page])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }, [products, search])

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value)
    setPage(0)
  }

  const handleStatusChange = (e) => {
    setFilterStatus(e.target.value)
    setPage(0)
  }

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormError(null)
  }

  const [editingProduct, setEditingProduct] = useState(null)

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      categoryId: product.categoryId?.toString() || '',
      active: product.active ?? true,
      imageUrl: product.imageUrl || '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const handleFormChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.sku.trim() || !form.name.trim() || !form.price || !form.categoryId) {
      setFormError('Completa los campos obligatorios: SKU, Nombre, Precio y Categoría')
      return
    }

    const price = parseFloat(form.price)
    if (isNaN(price) || price <= 0) {
      setFormError('El precio debe ser un número mayor a 0')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price,
        categoryId: form.categoryId,
        active: form.active,
        imageUrl: form.imageUrl.trim() || undefined,
      }
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await createProduct(payload)
      }
      closeModal()
      setPage(0)
      loadProducts()
    } catch (err) {
      let msg = editingProduct ? 'Error al actualizar producto' : 'Error al crear producto'
      try {
        const parsed = JSON.parse(err.message)
        msg = parsed.message || msg
      } catch {}
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteProduct(confirmDelete.id)
      setConfirmDelete(null)
      loadProducts()
    } catch (err) {
      let msg = 'Error al eliminar producto'
      try { const parsed = JSON.parse(err.message); msg = parsed.message || msg } catch {}
      setError(msg)
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Productos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fourth)' }}>
            {totalElements} productos registrados
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{
            background: 'var(--third)',
            color: '#fff',
          }}
        >
          <Plus size={16} />
          Agregar producto
        </button>
      </div>

      <div
        className="rounded-lg border p-4"
        style={{
          background: 'var(--primary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm flex-1 min-w-[200px]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-hover)',
            }}
          >
            <Search size={16} style={{ color: 'var(--fourth)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white text-[13px] w-full placeholder:text-[var(--fourth)]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={handleCategoryChange}
            className="px-3 py-1.5 rounded-md text-[13px] outline-none cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-hover)',
              color: 'var(--fourth)',
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={handleStatusChange}
            className="px-3 py-1.5 rounded-md text-[13px] outline-none cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-hover)',
              color: 'var(--fourth)',
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--third)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--fourth)' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Package size={40} style={{ color: 'var(--fourth)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr
                    className="text-left text-[11px] uppercase tracking-wider"
                    style={{ color: 'var(--fourth)', opacity: 0.6 }}
                  >
                    <th className="pb-3 pr-4 font-medium">Producto</th>
                    <th className="pb-3 pr-4 font-medium">SKU</th>
                    <th className="pb-3 pr-4 font-medium">Precio</th>
                    <th className="pb-3 pr-4 font-medium">Categoría</th>
                    <th className="pb-3 pr-4 font-medium">Estado</th>
                    <th className="pb-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-md flex items-center justify-center text-[10px] overflow-hidden shrink-0"
                            style={{
                              background: 'var(--surface-hover)',
                            }}
                          >
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={16} style={{ color: 'var(--fourth)' }} />
                            )}
                          </div>
                          <span className="text-white font-medium truncate max-w-[200px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4" style={{ color: 'var(--fourth)' }}>
                        {product.sku}
                      </td>
                      <td className="py-3 pr-4 text-white font-medium">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-3 pr-4" style={{ color: 'var(--fourth)' }}>
                        {product.categoryName}
                      </td>
                        <td className="py-3 pr-4">
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: product.active
                                ? 'rgba(34,197,94,0.15)'
                                : 'rgba(239,68,68,0.15)',
                              color: product.active ? '#22c55e' : '#ef4444',
                            }}
                          >
                            {product.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(product)}
                              className="p-1.5 rounded-md text-[11px] transition-opacity hover:opacity-70"
                              style={{ color: '#A78BFA' }}>
                              Editar
                            </button>
                            <button onClick={async () => {
                              try {
                                await setProductActive(product.id, !product.active)
                                loadProducts()
                              } catch (err) { alert(err.message) }
                            }}
                              className="p-1.5 rounded-md text-[11px] transition-opacity hover:opacity-70"
                              style={{
                                color: product.active ? '#f59e0b' : '#22c55e',
                              }}>
                              {product.active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(product)}
                              className="p-1.5 rounded-md transition-opacity hover:opacity-70"
                              style={{ color: 'rgba(239,68,68,0.6)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="flex items-center justify-between pt-4 mt-2 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-[12px]" style={{ color: 'var(--fourth)' }}>
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-30 transition-opacity"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fourth)',
                  }}
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-30 transition-opacity"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fourth)',
                  }}
                >
                  Siguiente
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="rounded-lg border w-full max-w-sm mx-4"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--surface)' }}
            >
              <h2 className="text-white font-semibold text-[15px]">Eliminar producto</h2>
              <button
                onClick={() => setConfirmDelete(null)}
                className="p-1 rounded-md transition-opacity hover:opacity-70"
                style={{ color: 'var(--fourth)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-[13px]" style={{ color: 'var(--fourth)' }}>
                ¿Estás seguro de eliminar <span className="text-white font-medium">{confirmDelete.name}</span>?
              </p>
              <p className="text-[12px]" style={{ color: 'rgba(239,68,68,0.7)' }}>
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fourth)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'rgba(239,68,68,0.2)',
                    color: '#ef4444',
                  }}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={closeModal}
        >
          <div
            className="rounded-lg border w-full max-w-lg mx-4"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--surface)' }}
            >
              <h2 className="text-white font-semibold text-[15px]">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-md transition-opacity hover:opacity-70"
                style={{ color: 'var(--fourth)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              {formError && (
                <div
                  className="px-3 py-2 rounded-md text-[12px]"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                    SKU <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={handleFormChange('sku')}
                    className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full"
                    style={{
                      background: 'var(--border)',
                      border: '1px solid var(--surface-hover)',
                      color: '#fff',
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleFormChange('name')}
                    className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full"
                    style={{
                      background: 'var(--border)',
                      border: '1px solid var(--surface-hover)',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={handleFormChange('description')}
                  rows={2}
                  className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full resize-none"
                  style={{
                    background: 'var(--border)',
                    border: '1px solid var(--surface-hover)',
                    color: '#fff',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                    Precio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={handleFormChange('price')}
                    className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full"
                    style={{
                      background: 'var(--border)',
                      border: '1px solid var(--surface-hover)',
                      color: '#fff',
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                    Categoría <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={handleFormChange('categoryId')}
                    className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full cursor-pointer"
                    style={{
                      background: 'var(--border)',
                      border: '1px solid var(--surface-hover)',
                      color: '#fff',
                    }}
                  >
                    <option value="" style={{ background: 'var(--primary)' }}>Seleccionar</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} style={{ background: 'var(--primary)' }}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                  URL de imagen
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={handleFormChange('imageUrl')}
                  className="px-3 py-1.5 rounded-md text-[13px] outline-none w-full"
                  style={{
                    background: 'var(--border)',
                    border: '1px solid var(--surface-hover)',
                    color: '#fff',
                  }}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={handleFormChange('active')}
                  className="w-4 h-4 rounded cursor-pointer accent-[var(--third)]"
                />
                <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>
                  Producto activo
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fourth)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'var(--third)',
                    color: '#fff',
                  }}
                >
                  {submitting ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Productos

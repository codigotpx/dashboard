import { useCallback, useEffect, useState } from 'react'
import {
  getCustomers, createCustomer, updateCustomer,
  deleteCustomer, setCustomerStatus, searchCustomersByEmail,
  getCustomerAddresses, createAddress, deleteAddress,
} from '../services/api'
import { X, Plus, Search, MapPin, Trash2, Phone, Mail, User } from 'lucide-react'

const initialForm = { name: '', email: '', phone: '', address: '' }

const Clientes = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [searchEmail, setSearchEmail] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', country: '' })
  const [showAddressForm, setShowAddressForm] = useState(false)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCustomers()
      setCustomers(Array.isArray(data) ? data : data?.content ?? [])
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCustomers() }, [loadCustomers])

  const handleSearch = async () => {
    if (!searchEmail.trim()) return loadCustomers()
    try {
      const data = await searchCustomersByEmail(searchEmail)
      setCustomers(data ? (Array.isArray(data) ? data : [data]) : [])
    } catch {
      setCustomers([])
    }
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await updateCustomer(editing.id, form)
      } else {
        await createCustomer(form)
      }
      setShowModal(false)
      setEditing(null)
      setForm(initialForm)
      loadCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await deleteCustomer(id)
      loadCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await setCustomerStatus(id, newStatus)
      loadCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name || '', email: c.email || '', phone: c.phone || '', address: c.address || '' })
    setShowModal(true)
  }

  const viewCustomer = async (c) => {
    setSelectedCustomer(c)
    try {
      const data = await getCustomerAddresses(c.id)
      setAddresses(Array.isArray(data) ? data : [])
    } catch {
      setAddresses([])
    }
  }

  const handleAddAddress = async () => {
    if (!selectedCustomer) return
    try {
      await createAddress(selectedCustomer.id, addressForm)
      setShowAddressForm(false)
      setAddressForm({ street: '', city: '', state: '', zip: '', country: '' })
      const data = await getCustomerAddresses(selectedCustomer.id)
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (!selectedCustomer || !confirm('¿Eliminar esta dirección?')) return
    try {
      await deleteAddress(selectedCustomer.id, addressId)
      const data = await getCustomerAddresses(selectedCustomer.id)
      setAddresses(Array.isArray(data) ? data : [])
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-white">Clientes</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg px-2 py-1.5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--fourth)' }} />
            <input
              placeholder="Buscar por email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-[12px] outline-none bg-transparent w-44"
              style={{ color: '#fff' }}
            />
          </div>
          <button onClick={() => { setEditing(null); setForm(initialForm); setShowModal(true) }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--third)', color: '#fff' }}>
            <Plus size={14} /> Nuevo
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border overflow-hidden"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    {['Nombre', 'Email', 'Teléfono', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wider"
                        style={{ color: 'var(--fourth)', opacity: 0.6 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 text-white">{c.name || '-'}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--fourth)' }}>{c.email}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--fourth)' }}>{c.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: c.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                            color: c.status === 'ACTIVE' ? '#22c55e' : '#ef4444',
                          }}>
                          {c.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => viewCustomer(c)}
                            className="text-[11px] px-2 py-1 rounded transition-opacity hover:opacity-80"
                            style={{ background: 'var(--surface)', color: 'var(--third)' }}>
                            Ver
                          </button>
                          <button onClick={() => openEdit(c)}
                            className="text-[11px] px-2 py-1 rounded transition-opacity hover:opacity-80"
                            style={{ background: 'var(--surface)', color: '#A78BFA' }}>
                            Editar
                          </button>
                          <button onClick={() => handleStatusToggle(c.id, c.status)}
                            className="text-[11px] px-2 py-1 rounded transition-opacity hover:opacity-80"
                            style={{
                              background: 'var(--surface)',
                              color: c.status === 'ACTIVE' ? '#f59e0b' : '#22c55e',
                            }}>
                            {c.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="text-[11px] px-2 py-1 rounded transition-opacity hover:opacity-80"
                            style={{ background: 'var(--surface)', color: '#ef4444' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                      No hay clientes
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border p-4"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
            {selectedCustomer ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-semibold text-white">{selectedCustomer.name || 'Cliente'}</h3>
                  <button onClick={() => setSelectedCustomer(null)}
                    className="p-1 rounded transition-opacity hover:opacity-70"
                    style={{ color: 'var(--fourth)' }}>
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--fourth)' }}>
                    <Mail size={13} /> {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--fourth)' }}>
                    <Phone size={13} /> {selectedCustomer.phone || '-'}
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--fourth)' }}>
                    <User size={13} /> {selectedCustomer.documentNumber || '-'}
                  </div>
                </div>

                <h4 className="text-[11px] uppercase tracking-wider font-semibold mb-2"
                  style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                  <MapPin size={12} className="inline mr-1" /> Direcciones
                </h4>
                <div className="space-y-1.5 mb-3">
                  {addresses.map((a) => (
                    <div key={a.id} className="flex items-start justify-between p-2 rounded-lg text-[12px]"
                      style={{ background: 'var(--surface)' }}>
                      <span style={{ color: 'var(--fourth)' }}>
                        {[a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')}
                      </span>
                      <button onClick={() => handleDeleteAddress(a.id)}
                        className="p-0.5 shrink-0" style={{ color: '#ef4444' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-[12px]" style={{ color: 'var(--fourth)', opacity: 0.5 }}>Sin direcciones</p>
                  )}
                </div>

                {showAddressForm ? (
                  <div className="space-y-1.5">
                    <input placeholder="Calle" value={addressForm.street}
                      onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))}
                      className="w-full rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
                    <input placeholder="Ciudad" value={addressForm.city}
                      onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}
                      className="w-full rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
                    <div className="flex gap-1.5">
                      <input placeholder="Estado" value={addressForm.state}
                        onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
                      <input placeholder="CP" value={addressForm.zip}
                        onChange={e => setAddressForm(p => ({ ...p, zip: e.target.value }))}
                        className="w-20 rounded-lg px-2.5 py-1.5 text-[12px] outline-none"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <button onClick={handleAddAddress}
                        className="text-[11px] px-3 py-1.5 rounded font-semibold"
                        style={{ background: 'var(--third)', color: '#fff' }}>Guardar</button>
                      <button onClick={() => setShowAddressForm(false)}
                        className="text-[11px] px-3 py-1.5 rounded"
                        style={{ background: 'var(--surface)', color: 'var(--fourth)' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-80"
                    style={{ color: 'var(--third)' }}>
                    <Plus size={13} /> Agregar dirección
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <User size={32} style={{ color: 'var(--fourth)', opacity: 0.3 }} />
                <p className="mt-2 text-sm" style={{ color: 'var(--fourth)', opacity: 0.5 }}>
                  Selecciona un cliente para ver detalles
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border p-6 w-full max-w-md"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">{editing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--fourth)' }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[['name', 'Nombre'], ['email', 'Email'], ['phone', 'Teléfono'], ['address', 'Dirección']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-[11px] font-semibold mb-1 block" style={{ color: 'var(--fourth)' }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: '#fff' }} />
                </div>
              ))}
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

export default Clientes

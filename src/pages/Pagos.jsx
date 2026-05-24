import { useEffect, useState, useMemo } from 'react'
import { DollarSign, CreditCard, Clock, XCircle, Search, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  fetchOrders, getOrder, getOrderItems, getOrderHistory, updateOrderStatus,
} from '../services/api'

const PIE_COLORS = ['#22c55e', '#f59e0b', '#7C3AED', '#ef4444', '#A78BFA']

const STATUS_LABELS = {
  CREATED: 'Creado',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLES = {
  PAID: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  CREATED: { bg: 'var(--surface-hover)', color: 'var(--third)' },
  SHIPPED: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  DELIVERED: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
}

const Pagos = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const [detailOrder, setDetailOrder] = useState(null)
  const [detailItems, setDetailItems] = useState([])
  const [detailHistory, setDetailHistory] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || 'Error al cargar pagos'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = orders
    if (filterStatus !== 'all') {
      list = list.filter((o) => o.status === filterStatus)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          o.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filterStatus, search])

  const stats = useMemo(() => {
    const totalIncome = orders
      .filter((o) => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPED')
      .reduce((s, o) => s + Number(o.total), 0)
    const paid = orders.filter((o) => o.status === 'PAID').length
    const pending = orders.filter((o) => o.status === 'CREATED').length
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length
    return { totalIncome, paid, pending, cancelled }
  }, [orders])

  const incomeByDate = useMemo(() => {
    const map = {}
    orders
      .filter((o) => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPED')
      .forEach((o) => {
        const date = o.createAt ? o.createAt.split('T')[0] : 'Sin fecha'
        map[date] = (map[date] || 0) + Number(o.total)
      })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, total]) => ({
        date: date.slice(5),
        total: Math.round(total * 100) / 100,
      }))
  }, [orders])

  const statusDist = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1
    })
    return Object.entries(map).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      status,
    }))
  }, [orders])

  const openDetail = async (order) => {
    setDetailOrder(order)
    setDetailLoading(true)
    try {
      const [items, history] = await Promise.all([
        getOrderItems(order.id).catch(() => []),
        getOrderHistory(order.id).catch(() => []),
      ])
      setDetailItems(Array.isArray(items) ? items : [])
      setDetailHistory(Array.isArray(history) ? history : [])
    } catch {
      setDetailItems([])
      setDetailHistory([])
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!detailOrder) return
    setUpdatingStatus(true)
    try {
      await updateOrderStatus(detailOrder.id, newStatus)
      const updated = await getOrder(detailOrder.id)
      setDetailOrder(updated)
      const history = await getOrderHistory(detailOrder.id).catch(() => [])
      setDetailHistory(Array.isArray(history) ? history : [])
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <div
          className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--third)', borderTopColor: 'transparent' }}
        />
      </section>
    )
  }

  if (error) {
    return (
      <section className="text-center py-24">
        <p className="text-sm" style={{ color: 'var(--fourth)' }}>{error}</p>
      </section>
    )
  }

  const cards = [
    {
      title: 'Ingresos totales',
      value: `$${stats.totalIncome.toFixed(2)}`,
      subtitle: 'órdenes pagadas',
      icon: <DollarSign size={20} />,
      color: '#22c55e',
    },
    {
      title: 'Pagados',
      value: stats.paid,
      subtitle: 'completados',
      icon: <CreditCard size={20} />,
      color: 'var(--third)',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      subtitle: 'por pagar',
      icon: <Clock size={20} />,
      color: '#f59e0b',
    },
    {
      title: 'Cancelados',
      value: stats.cancelled,
      subtitle: 'sin cobro',
      icon: <XCircle size={20} />,
      color: '#ef4444',
    },
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Pagos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fourth)' }}>
            {orders.length} órdenes registradas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border p-4"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <p
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--fourth)', opacity: 0.7 }}
              >
                {card.title}
              </p>
              <div
                className="p-1.5 rounded-lg"
                style={{ background: 'var(--surface)', color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums leading-none mb-1">
              {card.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div
          className="rounded-lg border p-4"
          style={{
            background: 'var(--primary)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-[11px] uppercase tracking-wider font-semibold mb-4"
            style={{ color: 'var(--fourth)', opacity: 0.7 }}
          >
            Ingresos recientes
          </h3>
          {incomeByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeByDate} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--fourth)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--fourth)' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => [`$${v}`, 'Ingreso']}
                  contentStyle={{
                    background: 'var(--primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              Sin ingresos registrados
            </p>
          )}
        </div>

        <div
          className="rounded-lg border p-4"
          style={{
            background: 'var(--primary)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-[11px] uppercase tracking-wider font-semibold mb-4"
            style={{ color: 'var(--fourth)', opacity: 0.7 }}
          >
            Estado de pagos
          </h3>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              Sin datos
            </p>
          )}
        </div>
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
              placeholder="Buscar por cliente o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white text-[13px] w-full placeholder:text-[var(--fourth)]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-md text-[13px] outline-none cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-hover)',
              color: 'var(--fourth)',
            }}
          >
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wider"
                style={{ color: 'var(--fourth)', opacity: 0.6 }}
              >
                <th className="pb-3 pr-4 font-medium">Orden</th>
                <th className="pb-3 pr-4 font-medium">Cliente</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const ss = STATUS_STYLES[order.status] || { bg: 'var(--surface)', color: 'var(--fourth)' }
                return (
                  <tr
                    key={order.id}
                    className="border-t cursor-pointer transition-all hover:opacity-80"
                    style={{ borderColor: 'var(--border)' }}
                    onClick={() => openDetail(order)}
                  >
                    <td className="py-3 pr-4">
                      <span className="text-white font-mono text-[12px]">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white">
                      {order.customerName || '—'}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium tabular-nums">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: ss.bg, color: ss.color }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--fourth)' }}>
                        <Calendar size={13} />
                        {order.createAt
                          ? new Date(order.createAt).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <CreditCard size={36} style={{ color: 'var(--fourth)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              No se encontraron pagos
            </p>
          </div>
        )}
      </div>
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDetailOrder(null)}>
          <div className="rounded-xl border w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
              style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
              <h2 className="text-sm font-bold text-white">Detalle de orden</h2>
              <button onClick={() => setDetailOrder(null)}
                className="p-1 rounded transition-opacity hover:opacity-70"
                style={{ color: 'var(--fourth)' }}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Orden', value: `#${detailOrder.id.slice(0, 8)}` },
                  { label: 'Cliente', value: detailOrder.customerName || '—' },
                  { label: 'Total', value: `$${Number(detailOrder.total).toFixed(2)}` },
                  {
                    label: 'Estado',
                    value: STATUS_LABELS[detailOrder.status] || detailOrder.status,
                    badge: true,
                    ss: STATUS_STYLES[detailOrder.status] || {},
                  },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                      {f.label}</p>
                    {f.badge ? (
                      <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: f.ss.bg, color: f.ss.color }}>{f.value}</span>
                    ) : (
                      <p className="text-[13px] font-semibold text-white">{f.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Update status */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-semibold mb-2"
                  style={{ color: 'var(--fourth)', opacity: 0.6 }}>Cambiar estado</h4>
                <div className="flex flex-wrap gap-1.5">
                  {['CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => {
                    const active = detailOrder.status === s
                    const ss = STATUS_STYLES[s] || {}
                    return (
                      <button key={s} disabled={active || updatingStatus}
                        onClick={() => handleStatusUpdate(s)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-opacity disabled:opacity-60 hover:opacity-85"
                        style={{
                          background: active ? ss.bg : 'var(--surface)',
                          color: active ? ss.color : 'var(--fourth)',
                          border: active ? `1px solid ${ss.color}` : '1px solid transparent',
                        }}>
                        {updatingStatus ? '...' : STATUS_LABELS[s]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-semibold mb-2"
                  style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                  Artículos ({detailItems.length})
                </h4>
                {detailLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--third)' }}>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cargando...
                  </div>
                ) : detailItems.length > 0 ? (
                  <div className="space-y-1.5">
                    {detailItems.map((item, i) => (
                      <div key={item.id || i}
                        className="flex items-center justify-between p-2.5 rounded-lg text-[12px]"
                        style={{ background: 'var(--surface)' }}>
                        <div>
                          <p className="text-white font-medium">{item.productName || `Producto #${item.productId}`}</p>
                          <p style={{ color: 'var(--fourth)' }}>
                            Cantidad: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <span className="font-semibold text-white">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] py-3" style={{ color: 'var(--fourth)', opacity: 0.5 }}>Sin artículos</p>
                )}
              </div>

              {/* History */}
              <div>
                <h4 className="text-[11px] uppercase tracking-wider font-semibold mb-2"
                  style={{ color: 'var(--fourth)', opacity: 0.6 }}>Historial de cambios</h4>
                {detailHistory.length > 0 ? (
                  <div className="space-y-1">
                    {detailHistory.map((h, i) => (
                      <div key={h.id || i}
                        className="flex items-center gap-3 p-2.5 rounded-lg text-[12px]"
                        style={{ background: 'var(--surface)' }}>
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: (STATUS_STYLES[h.status] || {}).color || 'var(--fourth)' }} />
                        <div className="flex-1">
                          <span className="font-medium" style={{ color: (STATUS_STYLES[h.status] || {}).color || '#fff' }}>
                            {STATUS_LABELS[h.status] || h.status}
                          </span>
                          {h.notes && (
                            <span className="ml-2" style={{ color: 'var(--fourth)', opacity: 0.7 }}>— {h.notes}</span>
                          )}
                        </div>
                        <span style={{ color: 'var(--fourth)', opacity: 0.5 }}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleString('es-CO') : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] py-3" style={{ color: 'var(--fourth)', opacity: 0.5 }}>Sin historial</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Pagos

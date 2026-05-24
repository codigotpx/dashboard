import { useEffect, useState, useMemo } from 'react'
import {
  ShoppingBag, ChevronDown, ChevronUp, Clock,
  TrendingUp, TrendingDown, Package,
} from 'lucide-react'
import { fetchOrders } from '../services/api'

const Ventas = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const { todaySales, yesterdaySales, weekSales, todayTotal, yesterdayTotal } = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    const today = []
    const yesterdayList = []
    const week = []

    orders.forEach((o) => {
      const d = o.createAt ? new Date(o.createAt) : null
      if (!d) return
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
      if (diffDays < 7) week.push(o)
      if (d.toDateString() === todayStr) today.push(o)
      if (d.toDateString() === yesterdayStr) yesterdayList.push(o)
    })

    const todayTotal = today.reduce((s, o) => s + Number(o.total), 0)
    const yesterdayTotal = yesterdayList.reduce((s, o) => s + Number(o.total), 0)

    today.sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
    week.sort((a, b) => new Date(b.createAt) - new Date(a.createAt))

    return {
      todaySales: today,
      yesterdaySales: yesterdayList,
      weekSales: week,
      todayTotal,
      yesterdayTotal,
    }
  }, [orders])

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  const pctChange = yesterdayTotal > 0
    ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
    : todayTotal > 0 ? 100 : 0

  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--third)', borderTopColor: 'transparent' }} />
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Ventas</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fourth)' }}>
            Actividad reciente de ventas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl border p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #0C0E19 100%)',
            borderColor: 'var(--border)',
          }}>
          <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
            <div className="w-full h-full rounded-full bg-white blur-3xl transform translate-x-16 -translate-y-16" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Ventas hoy
            </p>
            <p className="text-3xl font-bold text-white tabular-nums mb-2">
              ${todayTotal.toFixed(2)}
            </p>
            <div className="flex items-center gap-1.5">
              {pctChange >= 0 ? (
                <TrendingUp size={14} style={{ color: '#22c55e' }} />
              ) : (
                <TrendingDown size={14} style={{ color: '#ef4444' }} />
              )}
              <span className="text-[12px] font-medium" style={{ color: pctChange >= 0 ? '#22c55e' : '#ef4444' }}>
                {pctChange > 0 ? '+' : ''}{pctChange}% vs ayer
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5"
          style={{ background: 'var(--primary)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
            Órdenes hoy
          </p>
          <p className="text-3xl font-bold text-white tabular-nums mb-2">
            {todaySales.length}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--fourth)' }}>
            {todaySales.reduce((s, o) => s + (o.orderItems?.length || 0), 0)} productos vendidos
          </p>
        </div>

        <div className="rounded-xl border p-5"
          style={{ background: 'var(--primary)', borderColor: 'var(--border)' }}>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
            Ventas ayer
          </p>
          <p className="text-3xl font-bold text-white tabular-nums mb-2">
            ${yesterdayTotal.toFixed(2)}
          </p>
          <p className="text-[12px]" style={{ color: 'var(--fourth)' }}>
            {yesterdaySales.length} órdenes
          </p>
        </div>
      </div>

      <div className="rounded-xl border"
        style={{ background: 'var(--primary)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center gap-2"
          style={{ borderColor: 'var(--surface)' }}>
          <Clock size={15} style={{ color: 'var(--third)' }} />
          <h2 className="text-[13px] font-semibold text-white">Actividad reciente</h2>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {weekSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ShoppingBag size={36} style={{ color: 'var(--fourth)', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                No hay ventas registradas
              </p>
            </div>
          ) : (
            weekSales.map((order, idx) => {
              const isToday = order.createAt && new Date(order.createAt).toDateString() === new Date().toDateString()
              const isExpanded = expanded[order.id]
              const items = order.orderItems ?? []
              const dateLabel = order.createAt
                ? new Date(order.createAt).toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'short',
                  })
                : ''

              return (
                <div key={order.id}>
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-[var(--surface)]"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: isToday ? 'var(--surface-hover)' : 'var(--surface)',
                          color: isToday ? 'var(--third)' : 'var(--fourth)',
                        }}>
                        <ShoppingBag size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] text-white font-medium truncate">
                            {order.customerName || 'Cliente'}
                          </p>
                          {isToday && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ background: 'var(--surface-hover)', color: 'var(--third)' }}>
                              Hoy
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--fourth)' }}>
                          {dateLabel} · {formatTime(order.createAt)} · {items.length} producto{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-[14px] font-bold text-white tabular-nums">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      {isExpanded ? (
                        <ChevronUp size={16} style={{ color: 'var(--fourth)' }} />
                      ) : (
                        <ChevronDown size={16} style={{ color: 'var(--fourth)' }} />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1">
                      <div className="pl-11 space-y-1.5">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-[11px] uppercase tracking-wider font-medium mb-2"
                          style={{ color: 'var(--fourth)', opacity: 0.5 }}>
                          <span>Producto</span>
                          <span>Cant.</span>
                          <span>Subtotal</span>
                        </div>
                        {items.map((item) => (
                          <div key={item.id}
                            className="grid grid-cols-[1fr_auto_auto] gap-4 text-[13px] items-center">
                            <div className="flex items-center gap-2 min-w-0">
                              <Package size={13} style={{ color: 'var(--fourth)' }} />
                              <span className="text-white truncate">{item.productName}</span>
                            </div>
                            <span className="tabular-nums" style={{ color: 'var(--fourth)' }}>x{item.quantity}</span>
                            <span className="text-white font-medium tabular-nums text-right">
                              ${Number(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default Ventas

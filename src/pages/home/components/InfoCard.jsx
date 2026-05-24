import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  ShoppingBag, DollarSign, Package, AlertTriangle,
  TrendingUp, ArrowUpRight, Layers,
} from 'lucide-react'

const COLORS_PIE = ['#7C3AED', '#A78BFA', '#f59e0b', '#ef4444']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const InfoCard = ({
  orders = [],
  lowStock,
  bestSelling,
  monthlyIncome,
  totalProducts = 0,
  categories,
  loading,
  errors,
}) => {
  const isLoading = loading.orders || loading.lowStock || loading.bestSelling
  const hasError = errors.orders || errors.lowStock || errors.bestSelling

  const delivered = orders.filter((o) => o.status === 'DELIVERED')
  const shipped = orders.filter((o) => o.status === 'SHIPPED')
  const cancelled = orders.filter((o) => o.status === 'CANCELLED')
  const paid = orders.filter((o) => o.status === 'PAID')

  const lowStockCount = lowStock?.length ?? 0
  const catCount = Array.isArray(categories) ? categories.length : 0

  const totalRevenue = useMemo(() => {
    return (monthlyIncome ?? []).reduce((s, i) => s + Number(i.total), 0)
  }, [monthlyIncome])

  const incomeChart = useMemo(() => {
    return (monthlyIncome ?? []).map((item) => ({
      label: MONTHS[item.month - 1] || item.month,
      income: Number(item.total),
    }))
  }, [monthlyIncome])

  const pieData = useMemo(() => {
    const statusCount = {}
    orders.forEach((o) => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1
    })
    const labels = { CREATED: 'Creadas', PAID: 'Pagadas', SHIPPED: 'Enviadas', DELIVERED: 'Entregadas', CANCELLED: 'Canceladas' }
    return Object.entries(statusCount).map(([status, count]) => ({
      name: labels[status] || status,
      value: count,
    }))
  }, [orders])

  const bestList = useMemo(() => {
    return (bestSelling ?? []).slice(0, 5)
  }, [bestSelling])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--third)' }}>
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Cargando datos...
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm" style={{ color: 'var(--danger)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M12 8v4m0 4h.01" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Error al cargar datos
      </div>
    )
  }

  const kpiCards = [
    {
      label: 'Ingresos totales',
      value: `$${totalRevenue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
      sub: 'últimos meses',
      icon: <DollarSign size={20} />,
      color: 'var(--third)',
    },
    {
      label: 'Órdenes',
      value: orders.length,
      sub: `${delivered.length} entregadas · ${shipped.length} enviadas`,
      icon: <ShoppingBag size={20} />,
      color: '#A78BFA',
    },
    {
      label: 'Productos',
      value: totalProducts,
      sub: `${catCount} categorías`,
      icon: <Package size={20} />,
      color: '#22c55e',
    },
    {
      label: 'Stock bajo',
      value: lowStockCount,
      sub: 'productos por reponer',
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Hero revenue */}
      {totalRevenue > 0 && (
        <div
          className="relative overflow-hidden rounded-xl border p-6"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #0C0E19 100%)',
            borderColor: 'rgba(124,58,237,0.3)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <div className="w-full h-full rounded-full bg-white blur-3xl transform translate-x-20 -translate-y-20" />
          </div>
          <div className="relative z-10 flex items-center gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Ingresos totales
              </p>
              <p className="text-4xl font-bold text-white tabular-nums mt-1">
                ${totalRevenue.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {paid.length} órdenes pagadas · {orders.length} totales
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-6 ml-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{delivered.length}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Entregadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{cancelled.length}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Canceladas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{totalProducts}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Productos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                {card.label}
              </p>
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--surface)', color: card.color }}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums leading-none mb-1">
              {card.value}
            </p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
              Ingresos mensuales
            </h3>
            <TrendingUp size={16} style={{ color: 'var(--fourth)' }} />
          </div>
          {incomeChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={incomeChart} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--fourth)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--fourth)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Ingreso']}
                  contentStyle={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="income" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos de ingresos</p>
            </div>
          )}
        </div>

        <div
          className="rounded-xl border p-5"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
            Estado de órdenes
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin órdenes</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border p-5"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
              Productos más vendidos
            </h3>
            <ArrowUpRight size={16} style={{ color: 'var(--fourth)' }} />
          </div>
          {bestList.length > 0 ? (
            <div className="space-y-2">
              {bestList.map((p, i) => (
                <div key={p.productId ?? i}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-0.5"
                  style={{ background: 'var(--surface)' }}>
                  <span className="text-[11px] font-bold w-5 text-center shrink-0" style={{ color: 'var(--fourth)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white font-medium truncate">{p.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--fourth)', opacity: 0.6 }}>SKU: {p.sku}</p>
                  </div>
                  <span className="text-[13px] font-bold text-white tabular-nums shrink-0">
                    {p.totalSold}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos de ventas</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5"
          style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fourth)', opacity: 0.7 }}>
            Resumen rápido
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>Pagadas</span>
              <span className="text-[13px] font-bold text-white tabular-nums">{paid.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>Pendientes</span>
              <span className="text-[13px] font-bold text-white tabular-nums">
                {orders.filter((o) => o.status === 'CREATED').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>Enviadas</span>
              <span className="text-[13px] font-bold text-white tabular-nums">{shipped.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>Canceladas</span>
              <span className="text-[13px] font-bold text-white tabular-nums">{cancelled.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-[13px]" style={{ color: 'var(--fourth)' }}>Categorías</span>
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-white tabular-nums">
                <Layers size={14} style={{ color: 'var(--third)' }} />
                {catCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoCard

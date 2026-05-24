import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp, Package, Users, AlertTriangle, Calendar,
  ChevronDown, ArrowUpRight, DollarSign, ShoppingBag, Layers,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import {
  fetchMonthlyIncome,
  fetchTopCustomers,
  fetchTopCategoriesByVolume,
  fetchBestSellingProducts,
  fetchOrders,
} from '../services/api'

const PIE_COLORS = ['#7C3AED', '#22c55e', '#f59e0b', '#ef4444', '#A78BFA', '#8b5cf6']

const TABS = [
  { id: 'overview', label: 'Resumen', icon: TrendingUp },
  { id: 'products', label: 'Productos', icon: Package },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'stock', label: 'Stock', icon: AlertTriangle },
]

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const Reportes = () => {
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  const [monthlyIncome, setMonthlyIncome] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [bestSelling, setBestSelling] = useState([])
  const [orders, setOrders] = useState([])

  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchMonthlyIncome(),
      fetchTopCustomers(),
      fetchTopCategoriesByVolume(),
      fetchOrders(),
    ])
      .then(([income, customers, categories, ords]) => {
        setMonthlyIncome(income ?? [])
        setTopCustomers(customers ?? [])
        setTopCategories(categories ?? [])
        setOrders(ords ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const now = new Date()
    const from = new Date(now)
    from.setDate(from.getDate() - parseInt(dateRange))
    fetchBestSellingProducts(from.toISOString(), now.toISOString())
      .then(setBestSelling)
      .catch(() => setBestSelling([]))
  }, [dateRange])

  const incomeChart = useMemo(() => {
    return monthlyIncome.map((item) => ({
      label: `${MONTHS[item.month - 1] || item.month} ${item.year}`,
      income: Number(item.total),
    }))
  }, [monthlyIncome])

  const bestSellingChart = useMemo(() => {
    return (bestSelling ?? []).slice(0, 8).map((item) => ({
      name: item.name.length > 20 ? item.name.slice(0, 20) + '...' : item.name,
      sold: item.totalSold,
    })).reverse()
  }, [bestSelling])

  const customerPodium = useMemo(() => {
    return (topCustomers ?? []).slice(0, 5)
  }, [topCustomers])

  const totalRevenue = useMemo(() => {
    return monthlyIncome.reduce((s, i) => s + Number(i.total), 0)
  }, [monthlyIncome])

  const totalOrders = orders.length
  const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'DELIVERED').length

  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--third)', borderTopColor: 'transparent' }} />
      </section>
    )
  }

  const TabBar = () => (
    <div className="flex gap-1 mb-6 p-1 rounded-lg"
      style={{ background: 'var(--border)', border: '1px solid var(--surface)' }}>
      {TABS.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-[12px] font-medium transition-all duration-200"
          style={{
            background: tab === id ? 'var(--third)' : 'transparent',
            color: tab === id ? '#fff' : 'var(--fourth)',
            boxShadow: tab === id ? '0 2px 8px var(--border)' : 'none',
          }}>
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Reportes</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fourth)' }}>
            Analítica y métricas del negocio
          </p>
        </div>
      </div>

      <TabBar />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div
            className="relative overflow-hidden rounded-xl border p-6"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #0C0E19 100%)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className="w-full h-full rounded-full bg-white blur-3xl transform translate-x-20 -translate-y-20" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}>
                Ingresos totales
              </p>
              <p className="text-4xl font-bold text-white tabular-nums mb-3">
                ${totalRevenue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <ShoppingBag size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-white tabular-nums leading-none">{totalOrders}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Órdenes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <DollarSign size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-white tabular-nums leading-none">{paidOrders}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Pagadas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Layers size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-white tabular-nums leading-none">{topCategories.length}</p>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Categorías
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-xl border p-5"
              style={{
                background: 'var(--primary)',
                borderColor: 'var(--border)',
              }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold"
                  style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                  Ingresos mensuales
                </h3>
                <TrendingUp size={16} style={{ color: 'var(--fourth)' }} />
              </div>
              {incomeChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={incomeChart} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--fourth)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--fourth)' }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Ingreso']}
                      contentStyle={{
                        background: 'var(--primary)', border: '1px solid var(--border)',
                        borderRadius: '8px', fontSize: '12px', color: '#fff',
                      }} />
                    <Area type="monotone" dataKey="income" stroke="#7C3AED" strokeWidth={2}
                      fill="url(#incomeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border p-5"
              style={{
                background: 'var(--primary)',
                borderColor: 'var(--border)',
              }}>
              <h3 className="text-[11px] uppercase tracking-wider font-semibold mb-4"
                style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                Categorías más vendidas
              </h3>
              {topCategories.length > 0 ? (
                <div className="space-y-3">
                  {topCategories.map((cat, i) => {
                    const total = topCategories.reduce((s, c) => s + c.totalQuantity, 0)
                    const pct = total > 0 ? Math.round((cat.totalQuantity / total) * 100) : 0
                    return (
                      <div key={cat.categoryName}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-white">{cat.categoryName}</span>
                          <span className="text-[12px] tabular-nums" style={{ color: 'var(--fourth)' }}>
                            {cat.totalQuantity}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--surface)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-5">
          <div
            className="rounded-xl border p-5"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                Productos más vendidos
              </h3>
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: 'var(--fourth)' }} />
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                  className="text-[12px] bg-transparent outline-none cursor-pointer"
                  style={{ color: 'var(--fourth)' }}>
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="90">90 días</option>
                </select>
              </div>
            </div>
            {bestSellingChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(200, bestSellingChart.length * 40)}>
                <BarChart data={bestSellingChart} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--fourth)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--fourth)' }} width={160} />
                  <Tooltip
                    formatter={(v) => [v, 'Unidades vendidas']}
                    contentStyle={{
                      background: 'var(--primary)', border: '1px solid var(--border)',
                      borderRadius: '8px', fontSize: '12px', color: '#fff',
                    }} />
                  <Bar dataKey="sold" fill="#7C3AED" radius={[0, 6, 6, 0]}
                    label={{ position: 'right', fontSize: 11, fill: 'var(--fourth)' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-5">
          <div
            className="rounded-xl border p-5"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                Top clientes
              </h3>
              <ArrowUpRight size={16} style={{ color: 'var(--fourth)' }} />
            </div>

            {customerPodium.length > 0 ? (
              <div className="space-y-2">
                {customerPodium.map((c, i) => {
                  const medals = ['#f59e0b', '#A78BFA', '#cd7f32']
                  const isPodium = i < 3
                  return (
                    <div key={c.customerId}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:translate-x-1"
                      style={{
                        background: isPodium ? 'var(--surface)' : 'transparent',
                        border: isPodium ? '1px solid var(--surface)' : '1px solid transparent',
                      }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                        style={{
                          background: isPodium ? `${medals[i]}20` : 'var(--surface)',
                          color: isPodium ? medals[i] : 'var(--fourth)',
                        }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white font-medium truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--fourth)' }}>
                          Total gastado
                        </p>
                      </div>
                      <p className="text-[15px] font-bold text-white tabular-nums shrink-0">
                        ${Number(c.total).toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>Sin datos</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-5">
          <div
            className="rounded-xl border p-5"
            style={{
              background: 'var(--primary)',
              borderColor: 'var(--border)',
            }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ color: 'var(--fourth)', opacity: 0.7 }}>
                Productos con stock bajo
              </h3>
              <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
            </div>

            {(() => {
              const lowStock = monthlyIncome.slice(0, 0)
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(bestSelling ?? []).slice(0, 6).length > 0 ? (
                    (bestSelling ?? []).slice(0, 6).map((p, i) => {
                      const colors = [
                        { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', dot: '#ef4444' },
                        { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
                        { bg: 'var(--surface)', border: 'var(--border)', dot: 'var(--third)' },
                      ]
                      const c = colors[i % colors.length]
                      return (
                        <div key={p.productId ?? i}
                          className="rounded-lg p-4 transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: c.dot }} />
                            <div className="min-w-0">
                              <p className="text-[13px] text-white font-medium truncate">{p.name}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: 'var(--fourth)' }}>
                                SKU: {p.sku}
                              </p>
                              <p className="text-[11px] mt-1" style={{ color: c.dot }}>
                                {p.totalSold} vendidos
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
                        Sin datos de stock bajo
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </section>
  )
}

export default Reportes

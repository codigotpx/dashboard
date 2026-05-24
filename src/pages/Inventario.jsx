import { useEffect, useState, useMemo } from 'react'
import {
  Package, PackageOpen, AlertTriangle, Tag, Plus, Minus, X, Search
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  fetchProducts,
  fetchInventories,
  fetchLowStockInventories,
  fetchCategories,
  adjustStock,
} from '../services/api'

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444']

const Inventario = () => {
  const [inventories, setInventories] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterStock, setFilterStock] = useState('all')

  const [adjustTarget, setAdjustTarget] = useState(null)
  const [adjustDelta, setAdjustDelta] = useState(0)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetchProducts(0, 100),
      fetchInventories(0, 100),
      fetchLowStockInventories(0, 100),
      fetchCategories(),
    ])
      .then(([prodData, invData, lowData, catData]) => {
        setProducts(prodData.content ?? prodData)
        setInventories(invData.content ?? invData)
        setLowStockItems(lowData.content ?? lowData)
        setCategories(catData ?? [])
      })
      .catch((err) => setError(err.message || 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  const productMap = useMemo(() => {
    const map = {}
    ;(products ?? []).forEach((p) => { map[p.id] = p })
    return map
  }, [products])

  const lowStockIds = useMemo(() => {
    const set = new Set()
    ;(lowStockItems ?? []).forEach((inv) => set.add(inv.productId))
    return set
  }, [lowStockItems])

  const enriched = useMemo(() => {
    let list = (inventories ?? []).map((inv) => {
      const prod = productMap[inv.productId]
      return {
        ...inv,
        productName: prod?.name ?? 'Desconocido',
        productSku: prod?.sku ?? '',
        productImage: prod?.imageUrl ?? '',
        productActive: prod?.active ?? false,
        status: inv.availableStock <= 0
          ? 'sin-stock'
          : inv.availableStock < inv.minimumStock
            ? 'bajo'
            : 'ok',
      }
    })

    if (filterStock === 'low') list = list.filter((i) => i.status === 'bajo' || i.status === 'sin-stock')
    else if (filterStock === 'out') list = list.filter((i) => i.status === 'sin-stock')

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.productSku.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const statusRank = { 'sin-stock': 0, bajo: 1, ok: 2 }
      return statusRank[a.status] - statusRank[b.status] || b.availableStock - a.availableStock
    })

    return list
  }, [inventories, productMap, filterStock, search])

  const stats = useMemo(() => {
    const totalStock = inventories.reduce((s, i) => s + i.availableStock, 0)
    const lowCount = lowStockItems.length
    const activeProducts = products.filter((p) => p.active).length
    return { totalStock, lowCount, activeProducts, categories: categories.length }
  }, [inventories, lowStockItems, products, categories])

  const chartData = useMemo(() => {
    return enriched
      .slice(0, 10)
      .map((i) => ({
        name: i.productName.length > 18 ? i.productName.slice(0, 18) + '...' : i.productName,
        stock: i.availableStock,
        min: i.minimumStock,
      }))
      .reverse()
  }, [enriched])

  const pieData = useMemo(() => {
    const ok = enriched.filter((i) => i.status === 'ok').length
    const low = enriched.filter((i) => i.status === 'bajo').length
    const out = enriched.filter((i) => i.status === 'sin-stock').length
    return [
      { name: 'Stock suficiente', value: ok },
      { name: 'Stock bajo', value: low },
      { name: 'Sin stock', value: out },
    ].filter((d) => d.value > 0)
  }, [enriched])

  const openAdjust = (item) => {
    setAdjustTarget(item)
    setAdjustDelta(0)
    setAdjustError(null)
  }

  const handleAdjust = async () => {
    if (!adjustTarget || adjustDelta === 0) return
    setAdjusting(true)
    setAdjustError(null)
    try {
      await adjustStock(adjustTarget.productId, adjustDelta)
      const updated = await fetchInventories(0, 100)
      setInventories(updated.content ?? updated)
      const lowUpdated = await fetchLowStockInventories(0, 100)
      setLowStockItems(lowUpdated.content ?? lowUpdated)
      setAdjustTarget(null)
    } catch (err) {
      let msg = 'Error al ajustar stock'
      try { const parsed = JSON.parse(err.message); msg = parsed.message || msg } catch {}
      setAdjustError(msg)
    } finally {
      setAdjusting(false)
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

  const statusStyle = (status) => {
    switch (status) {
      case 'sin-stock':
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Sin stock' }
      case 'bajo':
        return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Stock bajo' }
      default:
        return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Ok' }
    }
  }

  const cards = [
    {
      title: 'Stock total',
      value: stats.totalStock,
      subtitle: 'unidades en inventario',
      icon: <Package size={20} />,
      color: 'var(--third)',
    },
    {
      title: 'Stock bajo',
      value: stats.lowCount,
      subtitle: 'productos por reponer',
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b',
    },
    {
      title: 'Productos activos',
      value: stats.activeProducts,
      subtitle: 'en catálogo',
      icon: <PackageOpen size={20} />,
      color: '#22c55e',
    },
    {
      title: 'Categorías',
      value: stats.categories,
      subtitle: 'registradas',
      icon: <Tag size={20} />,
      color: 'var(--fourth)',
    },
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Inventario</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fourth)' }}>
            {enriched.length} productos en inventario
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
            Niveles de stock (top 10)
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--fourth)' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--fourth)' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="stock" fill="#7C3AED" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              Sin datos
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
            Estado del inventario
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
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
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white text-[13px] w-full placeholder:text-[var(--fourth)]"
            />
          </div>

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-3 py-1.5 rounded-md text-[13px] outline-none cursor-pointer"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-hover)',
              color: 'var(--fourth)',
            }}
          >
            <option value="all">Todos</option>
            <option value="low">Stock bajo</option>
            <option value="out">Sin stock</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr
                className="text-left text-[11px] uppercase tracking-wider"
                style={{ color: 'var(--fourth)', opacity: 0.6 }}
              >
                <th className="pb-3 pr-4 font-medium">Producto</th>
                <th className="pb-3 pr-4 font-medium">SKU</th>
                <th className="pb-3 pr-4 font-medium">Stock</th>
                <th className="pb-3 pr-4 font-medium">Mínimo</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((item) => {
                const ss = statusStyle(item.status)
                return (
                  <tr
                    key={item.id}
                    className="border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden shrink-0"
                          style={{ background: 'var(--surface-hover)' }}
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={16} style={{ color: 'var(--fourth)' }} />
                          )}
                        </div>
                        <span className="text-white font-medium truncate max-w-[200px]">
                          {item.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4" style={{ color: 'var(--fourth)' }}>
                      {item.productSku}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-medium tabular-nums ${item.availableStock <= 0 ? 'text-red-400' : item.availableStock < item.minimumStock ? 'text-amber-400' : 'text-white'}`}
                      >
                        {item.availableStock}
                      </span>
                    </td>
                    <td className="py-3 pr-4" style={{ color: 'var(--fourth)' }}>
                      {item.minimumStock}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: ss.bg, color: ss.color }}
                      >
                        {ss.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => openAdjust(item)}
                        className="p-1.5 rounded-md transition-opacity hover:opacity-70"
                        style={{ color: 'var(--fourth)' }}
                      >
                        <Plus size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {enriched.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <PackageOpen size={36} style={{ color: 'var(--fourth)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
              No hay inventario registrado
            </p>
          </div>
        )}
      </div>

      {adjustTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setAdjustTarget(null)}
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
              <h2 className="text-white font-semibold text-[15px]">Ajustar stock</h2>
              <button
                onClick={() => setAdjustTarget(null)}
                className="p-1 rounded-md transition-opacity hover:opacity-70"
                style={{ color: 'var(--fourth)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <p className="text-[13px] text-white font-medium">{adjustTarget.productName}</p>
              <p className="text-[12px]" style={{ color: 'var(--fourth)' }}>
                Stock actual: <span className="text-white font-medium tabular-nums">{adjustTarget.availableStock}</span>
              </p>

              {adjustError && (
                <div
                  className="px-3 py-2 rounded-md text-[12px]"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {adjustError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAdjustDelta((d) => d - 1)}
                  className="p-2 rounded-md transition-opacity hover:opacity-70"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    color: '#ef4444',
                  }}
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 rounded-md text-[15px] text-center font-bold outline-none tabular-nums"
                  style={{
                    background: 'var(--border)',
                    border: '1px solid var(--surface-hover)',
                    color: '#fff',
                  }}
                />
                <button
                  onClick={() => setAdjustDelta((d) => d + 1)}
                  className="p-2 rounded-md transition-opacity hover:opacity-70"
                  style={{
                    background: 'rgba(34,197,94,0.15)',
                    color: '#22c55e',
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex justify-between text-[12px]" style={{ color: 'var(--fourth)' }}>
                <span>Valor negativo = retirar</span>
                <span>
                  Resultado: <span className="text-white tabular-nums">{adjustTarget.availableStock + adjustDelta}</span>
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fourth)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdjust}
                  disabled={adjusting || adjustDelta === 0}
                  className="px-4 py-1.5 rounded-md text-[13px] font-medium disabled:opacity-50 transition-opacity"
                  style={{
                    background: 'var(--third)',
                    color: '#fff',
                  }}
                >
                  {adjusting ? 'Ajustando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Inventario

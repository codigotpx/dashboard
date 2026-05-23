import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS_PIE = ['#018ABE', '#97CADB']

const InfoCard = ({
    totalOrders,
    deliveredCount,
    shippedCount,
    cancelledCount,
    lowStock,
    bestSelling,
    loading,
    errors
  }) => {
    if (loading.orders || loading.lowStock || loading.bestSelling) {
      return (
        <div className="flex items-center gap-2 text-sm text-(--third) py-4">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Cargando datos...
        </div>
      )
    }
  
    if (errors.orders || errors.lowStock || errors.bestSelling) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-500 py-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 8v4m0 4h.01" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Error al cargar datos
        </div>
      )
    }
  
    const lowStockCount = lowStock?.length ?? 0
  
    const cards = [
      {
        title: 'Órdenes entregadas',
        value: deliveredCount,
        subtitle: `de ${totalOrders} totales`,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
        variant: 'primary',
      },
      {
        title: 'Enviadas',
        value: shippedCount,
        subtitle: 'listas para entregar',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        ),
        variant: 'secondary',
      },
      {
        title: 'Stock bajo',
        value: lowStockCount,
        subtitle: 'productos por reponer',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        variant: 'warning',
      },
      {
        title: 'Canceladas',
        value: cancelledCount,
        subtitle: 'órdenes canceladas',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        variant: 'danger',
      },
    ]
  
    const variantStyles = {
      primary: {
        wrapper: 'bg-(--primary) border-transparent',
        iconBg: 'bg-white/10',
        iconColor: 'text-(--fourth)',
        title: 'text-(--fourth)',
        value: 'text-white',
        subtitle: 'text-(--fourth)/70',
        bar: 'bg-white/20',
        barFill: 'bg-(--third)',
      },
      secondary: {
        wrapper: 'bg-white border-(--fourth) hover:border-(--third)',
        iconBg: 'bg-(--fifth)',
        iconColor: 'text-(--secundary)',
        title: 'text-(--third)',
        value: 'text-(--secundary)',
        subtitle: 'text-gray-400',
        bar: 'bg-(--fifth)',
        barFill: 'bg-(--third)',
      },
      warning: {
        wrapper: 'bg-white border-amber-200 hover:border-amber-400',
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        title: 'text-amber-500',
        value: 'text-amber-700',
        subtitle: 'text-gray-400',
        bar: 'bg-amber-50',
        barFill: 'bg-amber-400',
      },
      danger: {
        wrapper: 'bg-white border-red-200 hover:border-red-400',
        iconBg: 'bg-red-50',
        iconColor: 'text-red-400',
        title: 'text-red-400',
        value: 'text-red-600',
        subtitle: 'text-gray-400',
        bar: 'bg-red-50',
        barFill: 'bg-red-400',
      },
    }
  
    const getProgress = (card) => {
      if (card.variant === 'primary' && totalOrders > 0) {
        return Math.round((deliveredCount / totalOrders) * 100)
      }
      if (card.variant === 'secondary' && totalOrders > 0) {
        return Math.round((shippedCount / totalOrders) * 100)
      }
      if (card.variant === 'danger' && totalOrders > 0) {
        return Math.round((cancelledCount / totalOrders) * 100)
      }
      return null
    }
  
    const pieData = [
      { name: 'Entregadas', value: deliveredCount },
      { name: 'Enviadas', value: shippedCount },
    ]

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const s = variantStyles[card.variant]
            const progress = getProgress(card)
  
            return (
              <div
                key={card.title}
                className={`
                  relative rounded-xl border p-5 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md
                  ${s.wrapper}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${s.title}`}>
                    {card.title}
                  </p>
                  <div className={`p-1.5 rounded-lg ${s.iconBg} ${s.iconColor}`}>
                    {card.icon}
                  </div>
                </div>
  
                <p className={`text-4xl font-bold tabular-nums leading-none mb-1 ${s.value}`}>
                  {card.value}
                </p>
                <p className={`text-xs mt-1.5 ${s.subtitle}`}>
                  {card.subtitle}
                </p>
  
                {progress !== null && (
                  <div className="mt-4">
                    <div className={`h-1 w-full rounded-full overflow-hidden ${s.bar}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${s.barFill}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-1 text-right ${s.subtitle}`}>{progress}%</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-(--fourth) p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-(--third) mb-4">
              Órdenes: Entregadas vs Enviadas
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS_PIE[pieData.indexOf(entry)]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-(--fourth) p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-(--third) mb-4">
              Productos más vendidos
            </h3>
            <div className="space-y-3">
              {bestSelling?.map((product, index) => (
                <div key={product.id ?? index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-(--fourth) w-4 text-right shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-sm text-(--secundary) truncate">{product.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-(--primary) tabular-nums shrink-0 ml-2">
                    {product.totalSold ?? product.quantity ?? product.sold}
                  </span>
                </div>
              ))}
              {(!bestSelling || bestSelling.length === 0) && (
                <p className="text-sm text-gray-400">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }
  
  export default InfoCard
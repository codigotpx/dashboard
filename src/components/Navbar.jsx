import { Link, useLocation } from 'react-router-dom'
import { Home, BadgeDollarSign, Monitor, BriefcaseBusiness, CreditCard, ChartNoAxesColumnDecreasing } from 'lucide-react'

const NAV_LINKS = [
  { href: '/inicio', name: 'Inicio', icon: <Home size={17} /> },
  { href: '/ventas', name: 'Ventas', icon: <BadgeDollarSign size={17} /> },
  { href: '/productos', name: 'Productos', icon: <Monitor size={17} /> },
  { href: '/inventario', name: 'Inventario', icon: <BriefcaseBusiness size={17} /> },
  { href: '/pagos', name: 'Pagos', icon: <CreditCard size={17} /> },
  { href: '/reportes', name: 'Reportes', icon: <ChartNoAxesColumnDecreasing size={17} /> },
]

const Navbar = () => {
  const { pathname } = useLocation()

  return (
    <aside
      className="h-screen w-56 flex flex-col shrink-0"
      style={{
        background: 'var(--secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="px-5 pt-7 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
          style={{ color: 'var(--third)' }}
        >
          Panel
        </p>
        <p className="text-white font-extrabold text-[18px] leading-tight tracking-tight">
          UniMarket
        </p>
      </div>

      <p
        className="text-[9px] font-semibold tracking-[0.22em] uppercase px-5 pt-5 pb-2"
        style={{ color: 'var(--fourth)', opacity: 0.5 }}
      >
        Navegación
      </p>

      <nav className="flex-1 flex flex-col gap-0.5 px-3 pb-3">
        {NAV_LINKS.map(({ href, name, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              to={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium relative transition-all duration-200"
              style={{
                color: active ? '#fff' : 'var(--fourth)',
                background: active ? 'var(--surface-hover)' : 'transparent',
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full"
                  style={{ background: 'var(--third)', left: '-13px' }}
                />
              )}
              <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
              {name}
            </Link>
          )
        })}
      </nav>

      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{
            background: 'var(--surface)',
            color: 'var(--third)',
          }}
        >
          AD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-white/90 truncate">Admin</p>
          <p className="text-[10px] truncate" style={{ color: 'var(--fourth)', opacity: 0.6 }}>
            admin@caribea.edu
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Navbar

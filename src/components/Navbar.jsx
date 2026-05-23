import { Link, useLocation } from 'react-router-dom'
import { Home, BadgeDollarSign, Monitor, BriefcaseBusiness, CreditCard, ChartNoAxesColumnDecreasing  } from 'lucide-react'

const NAV_LINKS = [
    { href: '/inicio', name: 'Inicio',     icon: <Home/> },
    { href: '/ventas', name: 'Ventas',     icon: <BadgeDollarSign/>},
    { href: '/productos', name: 'Productos', icon: <Monitor/> },
    { href: '/inventario', name: 'Inventario', icon: <BriefcaseBusiness/> },
    { href: '/pagos', name: 'Pagos',       icon: <CreditCard/> },
    { href: '/reportes', name: 'Reportes', icon: <ChartNoAxesColumnDecreasing /> },
]

const Navbar = () => {
  const { pathname } = useLocation()

  return (
    <aside className="h-screen w-56 flex flex-col relative"
        style={{ background: 'var(--primary)', borderRight: '1px solid rgba(1,138,190,0.2)' }}>

        {/* Header */}
        <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(1,138,190,0.18)' }}>
            <p className="text-[9px] tracking-[0.18em] uppercase mb-1]" style={{ color: 'var(--third)' ,fontFamily: 'monospace' }}>
            Panel Administrativo
            </p>
            <p className="text-white font-bold text-[17px] leading-tight">
            Universidad<br />Caribea
            </p>
        </div>

      {/* Nav */}
      <p className="text-[8px] tracking-[0.2em] uppercase px-5 pt-4 pb-1" style={{ color: 'var(--fourth)', opacity: 0.45, fontFamily: 'monospace' }}>
        Navegación
      </p>

      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {NAV_LINKS.map(({ href, name, icon }) => {
            const active = pathname === href
            return (
                <Link key={href} to={href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium relative transition-all duration-150"
                style={{
                    color: active ? '#fff' : 'rgba(214,232,238,0.55)',
                    background: active ? 'rgba(1,138,190,0.18)' : 'transparent',
                }}>
                {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 rounded-r"
                    style={{ background: 'var(--third)', left: '-4px' }} />
                )}
                {icon}
                {name}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--third)' }} />}
                </Link>
            )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-t" style={{ borderColor: 'rgba(1,138,190,0.12)' }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0"
            style={{ background: 'var(--secondary)', border: '1px solid rgba(151,202,219,0.25)', color: 'var(--fourth)' }}>
                AD
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/85 truncate">Administrador</p>
                <p className="text-[9px] font-mono truncate" style={{ color: 'var(--fourth)', opacity: 0.55 }}>admin@caribea.edu</p>
            </div>
        </div>
    </aside>
  )
}

export default Navbar
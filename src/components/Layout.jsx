import { Outlet } from "react-router-dom"
import Navbar from './Navbar'
import { DataProvider } from '../context/DataContext'

const Layout = () => {
    return(
        <DataProvider>
            <section className="flex h-dvh" style={{ background: 'var(--primary)' }}>
                <Navbar/>
                <main className="flex-1 overflow-y-auto min-w-0"
                    style={{ background: 'var(--primary)' }}>
                    <section className="p-5">
                        <Outlet/>
                    </section>
                </main>
            </section>
        </DataProvider>
    )
}
export default Layout
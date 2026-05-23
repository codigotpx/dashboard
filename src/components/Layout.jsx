import { Outlet } from "react-router-dom"
import Navbar from './Navbar'
import Topbar from './Topbar'
import { DataProvider } from '../context/DataContext'

const Layout = () => {
    return(
        <DataProvider>
            <section className="flex h-dvh">
                <Navbar/>
                <main className="flex-1 overflow-y-auto min-w-0 bg-(--fifth)">
                    <Topbar />
                    <section className="p-4">
                        <Outlet/>
                    </section>
                </main>
            </section>
        </DataProvider>
    )
}
export default Layout
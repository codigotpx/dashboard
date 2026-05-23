import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/home/Home'
import Ventas from './pages/Ventas'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Pagos from './pages/Pagos'
import Reportes from './pages/Reportes'
import Login from './auth/Login'
import Register from './auth/Register'
import ProtectedRoute from './auth/ProtectedRoute'
import GuestRoute from './auth/GuestRoute'
import { AuthProvider } from './context/AuthContext'

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/inicio" replace />,
      },
      {
        path: 'inicio',
        element: <Home />,
      },
      {
        path: 'ventas',
        element: <Ventas />,
      },
      {
        path: 'productos',
        element: <Productos />,
      },
      {
        path: 'inventario',
        element: <Inventario />,
      },
      {
        path: 'pagos',
        element: <Pagos />,
      },
      {
        path: 'reportes',
        element: <Reportes />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-(--fifth)"><p className="text-gray-500">Cargando...</p></div>
  }

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />
  }

  return children
}

export default GuestRoute

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-(--fifth)"><p className="text-gray-500">Cargando...</p></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute

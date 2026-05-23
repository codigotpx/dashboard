import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { login as loginApi } from './authApi'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSuccess } = useAuth()
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(event.target)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      await loginApi(email, password)
      await loginSuccess()
      const from = location.state?.from?.pathname ?? '/inicio'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-dvh items-center justify-center bg-(--fifth) p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-(--primary)">Iniciar sesión</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-(--secundary)">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ingrese su email"
              required
              className="rounded border border-(--fourth) px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-(--secundary)">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingrese su contraseña"
              required
              className="rounded border border-(--fourth) px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-(--third) px-4 py-2 text-white disabled:opacity-60"
          >
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-(--secundary)">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-(--third) underline">
            Registrarse
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login

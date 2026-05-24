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
    <section className="flex min-h-dvh items-center justify-center p-4"
      style={{ background: 'var(--primary)' }}>
      <div className="w-full max-w-md rounded-xl p-8"
        style={{
          background: 'var(--secondary)',
          border: '1px solid var(--border)',
        }}>
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
          style={{ color: 'var(--third)' }}>
          UniMarket
        </p>
        <h1 className="mb-6 text-xl font-bold text-white">Iniciar sesión</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px]" style={{ color: 'var(--fourth)' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ingrese su email"
              required
              className="rounded-lg px-3 py-2 text-[13px] outline-none w-full"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: '#fff',
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px]" style={{ color: 'var(--fourth)' }}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingrese su contraseña"
              required
              className="rounded-lg px-3 py-2 text-[13px] outline-none w-full"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: '#fff',
              }}
            />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg px-4 py-2.5 text-[13px] font-semibold disabled:opacity-50 transition-opacity"
            style={{
              background: 'var(--third)',
              color: '#fff',
            }}
          >
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-5 text-center text-[13px]" style={{ color: 'var(--fourth)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium underline transition-opacity hover:opacity-80"
            style={{ color: 'var(--third)' }}>
            Registrarse
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Login

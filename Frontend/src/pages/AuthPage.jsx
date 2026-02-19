import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/lobby'

  if (isAuthenticated) {
    navigate(from, { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!username.trim()) {
          setError('Username is required')
          return
        }
        await register(username, email, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>1v1 Math Quiz</h1>
        <p className={styles.subtitle}>
          {mode === 'login' ? 'Sign in to play' : 'Create an account'}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              autoComplete="username"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} className={styles.submit}>
            {loading ? '...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
          className={styles.toggle}
        >
          {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}

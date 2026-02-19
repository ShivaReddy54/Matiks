import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { memo } from 'react'
import styles from './Layout.module.css'

function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          1v1 Math Quiz
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? styles.active : '')}>
            Leaderboard
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/lobby" className={({ isActive }) => (isActive ? styles.active : '')}>
                Lobby
              </NavLink>
              <span className={styles.user}>
                {user?.username} <span className={styles.rating}>{user?.rating}</span>
              </span>
              <button type="button" onClick={handleLogout} className={styles.btnLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
              Login
            </NavLink>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default memo(Layout)

import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const { isAuthenticated } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.leaderboard.list({ page, limit: 15 })
      setLeaderboard(r.leaderboard || [])
      setTotalPages(r.pagination?.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page])

  const loadMyRank = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const r = await api.leaderboard.myRank()
      setMyRank(r)
    } catch {
      setMyRank(null)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  useEffect(() => {
    loadMyRank()
  }, [loadMyRank])

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Leaderboard</h2>

        {myRank && (
          <div className={styles.myRank}>
            <span>Your rank: #{myRank.rank}</span>
            <span>{myRank.rating} pts</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <ul className={styles.list}>
            {leaderboard.map((u) => (
              <li key={u.username} className={styles.row}>
                <span className={styles.rank}>#{u.rank}</span>
                <span className={styles.username}>{u.username}</span>
                <span className={styles.rating}>{u.rating}</span>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={styles.pageBtn}
            >
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={styles.pageBtn}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

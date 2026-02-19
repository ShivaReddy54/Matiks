import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import styles from './LobbyPage.module.css'

export default function LobbyPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)
  const navigate = useNavigate()

  const checkStatus = useCallback(async () => {
    try {
      const r = await api.matchmaking.current()
      setStatus(r)
      if (r.status === 'MATCHED') {
        setPolling(false)
        navigate('/game', { state: { matchId: r.matchId, match: r.match } })
      }
    } catch (err) {
      setError(err.message)
    }
  }, [navigate])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  useEffect(() => {
    if (!polling) return
    const iv = setInterval(checkStatus, 2000)
    return () => clearInterval(iv)
  }, [polling, checkStatus])

  const handleJoin = async () => {
    setError('')
    setLoading(true)
    try {
      const r = await api.matchmaking.join()
      setStatus(r)
      if (r.status === 'MATCHED') {
        navigate('/game', { state: { matchId: r.matchId, match: r.match } })
      } else {
        setPolling(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    setError('')
    setLoading(true)
    try {
      await api.matchmaking.leave()
      setStatus({ status: 'IDLE' })
      setPolling(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>1v1 Matchmaking</h2>
        <p className={styles.subtitle}>
          {status?.status === 'QUEUED' && 'Searching for opponent...'}
          {status?.status === 'MATCHED' && 'Match found! Redirecting...'}
          {status?.status === 'IDLE' && 'Ready to play. Enter the queue!'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            onClick={handleJoin}
            disabled={loading || status?.status === 'QUEUED'}
            className={styles.btnPrimary}
          >
            {status?.status === 'QUEUED' ? 'Searching...' : 'Enter 1v1'}
          </button>
          <button
            onClick={handleLeave}
            disabled={loading || status?.status === 'IDLE'}
            className={styles.btnSecondary}
          >
            Leave Queue
          </button>
        </div>

        {status?.status === 'QUEUED' && (
          <div className={styles.spinnerWrapper}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  )
}

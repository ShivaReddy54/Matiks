import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/client'
import styles from './GamePage.module.css'

const OP_SYMBOL = { '+': '+', '-': '−', '*': '×' }

export default function GamePage() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const matchId = state?.matchId

  const [game, setGame] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)
  const displayIntervalRef = useRef(null)
  const gameIdRef = useRef(null)

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (displayIntervalRef.current) clearInterval(displayIntervalRef.current)
    timerRef.current = null
    displayIntervalRef.current = null
  }, [])

  const fetchResult = useCallback(
    async (gameId) => {
      const id = gameId ?? gameIdRef.current
      if (!id) return
      clearTimers()
      try {
        const r = await api.game.result(id)
        setGame((prev) => ({ ...prev, ...r, status: 'COMPLETED' }))
        refreshUser()
      } catch (err) {
        setError(err.message)
      }
    },
    [clearTimers, refreshUser]
  )

  const startGame = useCallback(async () => {
    if (!matchId) {
      navigate('/lobby')
      return
    }
    setLoading(true)
    setError('')
    try {
      const g = await api.game.start(matchId)
      setGame(g)
      gameIdRef.current = g.gameId
      setCurrentIdx(0)
      setAnswer('')

      if (g.status === 'COMPLETED') {
        refreshUser()
        navigate('/lobby')
        return
      }

      const endTime = new Date(g.endTime).getTime()
      const msLeft = Math.max(0, endTime - Date.now())

      if (msLeft <= 0) {
        await fetchResult(g.gameId)
        return
      }

      timerRef.current = setTimeout(() => {
        fetchResult(g.gameId)
      }, msLeft)

      displayIntervalRef.current = setInterval(() => {
        const sec = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
        setGame((prev) => {
          if (!prev || prev.status === 'COMPLETED') return prev
          return { ...prev, _timeLeft: sec }
        })
      }, 500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [matchId, fetchResult, refreshUser, navigate])

  const handleLeaveMatch = useCallback(async () => {
    try {
      await api.matchmaking.leave()
      refreshUser()
      navigate('/lobby')
    } catch (err) {
      setError(err.message)
    }
  }, [refreshUser, navigate])

  useEffect(() => {
    startGame()
    return () => clearTimers()
  }, [matchId])

  useEffect(() => {
    if (!game || game.status === 'COMPLETED') return
    const t = game._timeLeft
    if (t !== undefined && t <= 0) {
      fetchResult()
      navigate('/lobby')
    }
  }, [game?._timeLeft, game?.status, fetchResult])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const val = parseInt(answer, 10)
    if (isNaN(val) || !game?.gameId) return

    setError('')
    try {
      const r = await api.game.answer(game.gameId, {
        questionIndex: currentIdx,
        answer: val,
      })
      setGame((prev) => prev && { ...prev, player1Score: r.player1Score, player2Score: r.player2Score })
      setCurrentIdx((i) => i + 1)
      setAnswer('')
    } catch (err) {
      if (err.message?.includes('Time is up') || err.message?.includes('ended')) {
        fetchResult(game.gameId)
        navigate('/lobby')
      } else {
        setError(err.message)
      }
    }
  }

  if (!matchId) {
    navigate('/lobby')
    return null
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Loading game...</div>
      </div>
    )
  }

  if (game?.status === 'COMPLETED') {
    const p1 = game.player1
    const p2 = game.player2
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Game Over</h2>
          <div className={styles.result}>
            <span>{p1?.username || 'P1'}</span>
            <span className={styles.score}>
              {game.player1Score} - {game.player2Score}
            </span>
            <span>{p2?.username || 'P2'}</span>
          </div>
          <button onClick={() => navigate('/lobby')} className={styles.btnBack}>
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  const q = game?.questions?.[currentIdx]
  const timeLeft = game?._timeLeft ?? 60

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.scores}>
          <span>{game?.player1?.username || 'P1'}</span>
          <span className={styles.score}>
            {game?.player1Score ?? 0} - {game?.player2Score ?? 0}
          </span>
          <span>{game?.player2?.username || 'P2'}</span>
        </div>

        <div className={styles.timer}>{timeLeft}s</div>

        {q ? (
          <>
            <div className={styles.question}>
              {q.num1} {OP_SYMBOL[q.op] || q.op} {q.num2} = ?
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                className={styles.input}
                autoFocus
              />
              <button type="submit" className={styles.submit}>
                Submit
              </button>
            </form>
          </>
        ) : (
          <div className={styles.waiting}>Waiting for next question...</div>
        )}

        <button onClick={handleLeaveMatch} className={styles.btnLeave}>
          Leave match (forfeit)
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  )
}

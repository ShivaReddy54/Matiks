const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : options.body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export const api = {
  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body }),
    login: (body) => request('/api/auth/login', { method: 'POST', body }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    forgotPassword: (body) => request('/api/auth/forget-password', { method: 'POST', body }),
    resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body }),
  },
  user: {
    me: () => request('/api/user/me'),
    update: (body) => request('/api/user/me', { method: 'PUT', body }),
    byUsername: (username) => request(`/api/user/${username}`),
  },
  matchmaking: {
    join: () => request('/api/matchmaking/join', { method: 'POST' }),
    leave: () => request('/api/matchmaking/leave', { method: 'POST' }),
    status: () => request('/api/matchmaking/status'),
    current: () => request('/api/matchmaking/current'),
  },
  game: {
    start: (matchId) => request(`/api/game/start/${matchId}`, { method: 'POST' }),
    answer: (gameId, body) => request(`/api/game/${gameId}/answer`, { method: 'POST', body }),
    state: (gameId) => request(`/api/game/${gameId}/state`),
    result: (gameId) => request(`/api/game/${gameId}/result`),
  },
  leaderboard: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString()
      return request(`/api/leaderboard${q ? `?${q}` : ''}`)
    },
    myRank: () => request('/api/leaderboard/me/rank'),
  },
}

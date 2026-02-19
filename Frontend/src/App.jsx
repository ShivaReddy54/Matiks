import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const AuthPage = lazy(() => import('./pages/AuthPage'))
const LobbyPage = lazy(() => import('./pages/LobbyPage'))
const GamePage = lazy(() => import('./pages/GamePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))

function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route
                path="/lobby"
                element={
                  <ProtectedRoute>
                    <LobbyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <GamePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

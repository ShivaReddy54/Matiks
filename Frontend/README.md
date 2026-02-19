# 1v1 Math Quiz - Frontend

React + Vite frontend for the 1v1 Math Quiz backend.

## Setup

```bash
npm install
```

## Run

1. Start the backend: `cd .. && node server.js` (from project root)
2. Start the frontend: `npm run dev`

Frontend runs at http://localhost:5173. Vite proxies `/api` to the backend (localhost:3001).

## Structure

```
src/
├── api/client.js       # API client with credentials
├── contexts/AuthContext.jsx
├── components/
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── AuthPage.jsx    # Login / Register
│   ├── LobbyPage.jsx   # Matchmaking
│   ├── GamePage.jsx    # Math quiz game
│   └── LeaderboardPage.jsx
├── App.jsx
└── main.jsx
```

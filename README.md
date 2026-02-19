# 🧠 Matiks-Like Real-Time Math Battle Platform (Modular Monolith)

A real-time multiplayer math game inspired by competitive mental-math platforms.
This project is implemented as a **Modular Monolith** using **Node.js**, designed with clear domain boundaries so it can be split into microservices later if needed.

---

## 📌 Project Overview

This platform allows users to:

* Sign up and manage profiles
* Play real-time 1v1 math battles
* Answer dynamically generated questions
* Compete based on speed and accuracy
* Track match history and ratings
* View leaderboards and rankings

The system focuses on **low latency gameplay**, **clean architecture**, and **scalability-ready design**.

---

## 🏗️ Architecture

We intentionally use a **Modular Monolith** instead of microservices.

Why?

* Faster development for early-stage product
* No operational overhead (no service orchestration)
* Easier debugging and deployment
* Designed with clear module boundaries → easy to extract later

### Internal Design Philosophy

> “Built like microservices, deployed like a monolith.”

Each domain is isolated inside its own module with:

* Controllers (HTTP layer)
* Services (business logic)
* Models (data layer)

---

## 📂 Project Structure

```
src/
 ├── app.js
 ├── server.js

 ├── modules/
 │    ├── auth/
 │    ├── users/
 │    ├── game/
 │    ├── matchmaking/
 │    ├── match/
 │    └── leaderboard/
 ├── middlewares/
 ├── config/
 └── utils/
```

---

## 🧩 Core Modules

### 🔐 Auth Module

Handles authentication and session management.

Features:

* Register / Login
* JWT authentication
* Password hashing
* Token refresh flow

---

### 👤 Users Module

Manages user identity and statistics.

Features:

* Profile management
* Match stats tracking
* Public user view

---

### 🎮 Game Module

Stateless math engine.

Features:

* Dynamic question generation
* Difficulty scaling
* Answer validation
* Score calculation

---

### ⚔️ Matchmaking Module

Pairs players for battles.

Features:

* Queue management
* Rating-based matching
* Match creation trigger

---

### 🏁 Match Module

Controls the match lifecycle.

Features:

* Create / start / end matches
* Persist results
* Match history retrieval

---

### 📊 Rating Module

Handles competitive ranking.

Features:

* ELO rating updates
* Rank tiers
* Progress tracking

---

### 🏆 Leaderboard Module

Provides fast read-heavy ranking data.

Features:

* Daily / Weekly / All-time boards
* Rank lookup
* Cached sorting

---

### 🔌 Real-Time Socket Layer

Handles gameplay synchronization.

Features:

* WebSocket match rooms
* Live scoring updates
* Timer synchronization
* Disconnect recovery

---

## 🗄️ Data Model Summary

Core entities:

* `User`
* `Match`
* `Question`
* `Answer`
* `MatchScore`
* `RatingHistory`

Designed for:

* Replayability
* Anti-cheat verification
* Analytics support
* Future microservice extraction

---

## 🔁 Match Lifecycle

```
User Joins Queue
      ↓
Match Created
      ↓
Questions Generated
      ↓
Real-Time Battle (WebSocket)
      ↓
Match Ends
      ↓
Scores Saved
      ↓
Ratings Updated
      ↓
Leaderboard Refreshed
```

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```
npm install
```

### 2️⃣ Setup Environment Variables

Create `.env` file:

```
PORT=3001
DB_URL=postgres://localhost/mathgame
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1h
```

### 3️⃣ Run Server

```
npm run dev
```

---

## 📡 API Base URL

```
http://localhost:3001/api/v1
```

---

## 🔑 Example Routes

### Auth

```
POST /auth/register
POST /auth/login
```

### Matches

```
POST /matches
GET  /matches/:id
POST /matches/:id/start
POST /matches/:id/end
```

### Leaderboard

```
GET /leaderboard/daily
GET /leaderboard/all-time
```

---

## ⚙️ Tech Stack

| Layer              | Technology        |
| ------------------ | ----------------- |
| Backend            | Node.js + Express |
| Real-Time          | Socket.IO         |
| Database           | PostgreSQL        |
| Auth               | JWT               |
| Caching (optional) | Redis             |
| Architecture       | Modular Monolith  |

---

## 📈 Future Improvements

* Achievements & streak system
* Anti-cheat heuristics
* Analytics dashboard
* Friends & social challenges
* Mobile client integration
* Gradual migration to microservices (if scale demands)

---

## 🧠 Design Goal

This project demonstrates:

* Real-time system design
* Clean modular backend architecture
* Competitive ranking algorithms
* Scalable foundation without premature complexity

---

## ✨ Author Notes

This project is intentionally engineered to reflect **production-grade backend thinking** while remaining practical to build and maintain as a single deployable service.

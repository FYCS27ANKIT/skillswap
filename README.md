# SkillSwap 🔄

> A modern, peer-to-peer skill-sharing platform where lifelong learners connect, barter skills, schedule live sessions, and grow together.

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%204.x-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208.x-47A248.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.x-black.svg)](https://socket.io/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [API Reference](#-api-reference)
  - [Authentication](#authentication-apiauth)
  - [Users](#users-apiusers)
  - [Swap Requests](#swap-requests-apiswaps)
  - [Messages & Chat](#messages-apimessages)
  - [Learning Sessions](#learning-sessions-apisessions)
  - [Reviews & Ratings](#reviews--ratings-apireviews)
  - [AI Assistant](#ai-assistant-apiai)
- [Real-Time WebSocket Events](#-real-time-websocket-events-socketio)
- [Environment Variables](#-environment-variables)
- [CI/CD & Deployment](#-cicd--deployment)
- [Roadmap & Completed Features](#-roadmap--completed-features)
- [License](#-license)

---

## 💡 About the Project

**SkillSwap** is a full-stack web application designed to democratize learning through direct knowledge exchange. Instead of paying for costly courses or private tutoring, users offer skills they excel at in exchange for skills they want to learn (e.g., swapping Python programming for Spanish conversation).

The platform handles reciprocal match detection, request negotiation workflows, calendar session scheduling with video classrooms, ratings & feedback, Google Gemini AI assistance, and secure real-time messaging between matched partners.

---

## ✨ Key Features

- **🔐 User Authentication & Authorization**:
  - Secure registration and login with JWT (JSON Web Tokens).
  - Password hashing with `bcryptjs`.
  - Protected client routes and authenticated API endpoints via Bearer token middleware.

- **🤖 AI-Powered Swap Assistant (Google Gemini AI)**:
  - **AI Bio Assistant**: Enhance your profile bio automatically with customizable tones (Friendly, Professional, Mentor).
  - **AI Swap Roadmap**: Synthesize customized 4-stage mutual learning curriculums tailored to both partners' skills.
  - **AI Icebreaker Generator**: One-click generation of personalized, engaging swap proposals.
  - Intelligent fallback support for seamless offline or high-availability operation.

- **📅 Learning Sessions & Integrated Video Classrooms**:
  - Interactive session scheduler with topic, duration (30/45/60/90 mins), date & time, and preparation notes.
  - Automatic 1-click WebRTC virtual meeting room generation (integrated with Jitsi Meet for video, audio, and screen sharing).
  - Session status lifecycle (`scheduled`, `completed`, `cancelled`) with learning hours logged.

- **⭐ Swapper Reputation & Star Reviews**:
  - 5-star rating system with verified feedback comments after completed swaps.
  - Aggregate rating calculation (`averageRating`, `reviewCount`) displayed on swapper cards and public profiles.
  - Endorsements tab on personal profile to track your teaching reputation.

- **🔍 Smart Matching & Advanced Discover Filters**:
  - Real-time search across swapper names, skills offered, and skills wanted.
  - Category filters: **Tech & Code**, **Design & Media**, **Languages**, **Music & Arts**, **Business & Soft Skills**.
  - **"Perfect Match!"** reciprocal mutual compatibility detection and filter.
  - Filter by 4+ star rating and sort by Best Match, Highest Rated, or Alphabetical.
  - Clickable skill tags for instant filtering.

- **🤝 Interactive Swap Proposal Lifecycle**:
  - Modal to explicitly choose which skill you offer to teach and which skill you want to learn.
  - Incoming requests panel: **Accept** or **Decline** incoming invitations.
  - Outgoing requests panel: Monitor pending proposals with ability to cancel.
  - Duplicate request prevention and one-active-swap enforcement.

- **🔔 In-App Notification Center**:
  - Dynamic navbar notification bell with unread badge count.
  - Dropdown preview for incoming swap invitations (with 1-click accept) and upcoming sessions within 48 hours.

- **💬 Real-Time 1-on-1 Chat**:
  - Built on **Socket.io** with instant message delivery.
  - Chat access strictly granted to accepted swap partners.
  - Real-time online/offline presence indicators.
  - Header shortcuts to start 1-click video calls, schedule sessions, and view AI curriculums.

- **🎨 Modern Glassmorphism UI**:
  - Sleek dark-mode aesthetic with CSS variables and frosted glass containers.
  - Fully responsive layout with smooth transitions and Lucide React icons.

---

## 🛠 Architecture & Tech Stack

```mermaid
flowchart LR
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI[Glassmorphism UI]
        Router[React Router DOM v7]
        AuthCtx[Auth Context]
        SocketClient[Socket.io Client]
        VideoCall[Jitsi Meet WebRTC]
    end

    subgraph Server ["Backend (Node.js + Express)"]
        API[Express REST API]
        AuthMW[JWT Auth Middleware]
        SocketServer[Socket.io Engine]
        AISvc[Gemini AI Service]
    end

    subgraph Database ["Database & Services"]
        Mongo[(MongoDB Atlas / Mongoose)]
        Gemini[Google Gemini AI API]
    end

    UI --> Router
    Router --> AuthCtx
    AuthCtx -->|REST API Requests| API
    SocketClient <-->|WebSockets (ws://)| SocketServer
    UI -.-> VideoCall
    API --> AuthMW
    AuthMW --> Mongo
    SocketServer --> Mongo
    API --> AISvc
    AISvc -.-> Gemini
```

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Real-Time Client**: [Socket.io Client v4.8](https://socket.io/)
- **Video & Audio**: WebRTC / Jitsi Meet integration
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js 4.19](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 8.3](https://mongoosejs.com/)
- **WebSockets**: [Socket.io 4.8](https://socket.io/)
- **Authentication**: [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **AI Engine**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini AI integration)

---

## 📁 Project Structure

```
skill-swap-app/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── models/
│   │   ├── Message.js             # 1-to-1 chat message schema
│   │   ├── Review.js              # Swapper rating & feedback schema
│   │   ├── Session.js             # Learning session schedule schema
│   │   ├── SwapRequest.js         # Swap request lifecycle schema
│   │   └── User.js                # User profile & credentials schema
│   ├── routes/
│   │   ├── aiRoutes.js            # /api/ai (bio, roadmap, icebreaker)
│   │   ├── authRoutes.js          # /api/auth (register, login)
│   │   ├── messageRoutes.js       # /api/messages (connections, message history)
│   │   ├── reviewRoutes.js        # /api/reviews (rating & feedback CRUD)
│   │   ├── sessionRoutes.js       # /api/sessions (scheduling & video rooms)
│   │   ├── swapRoutes.js          # /api/swaps (CRUD swap requests)
│   │   └── userRoutes.js          # /api/users (discovery, profile, ratings)
│   ├── services/
│   │   └── aiService.js           # Gemini AI SDK & smart heuristic fallbacks
│   ├── db.js                      # MongoDB connection setup
│   ├── package.json
│   ├── server.js                  # Express app & Socket.io server entry point
│   └── .env                       # Backend environment configuration
│
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Global navigation bar with notifications
│   │   │   ├── NotificationDropdown.jsx # Real-time notification center
│   │   │   ├── ProposalModal.jsx        # Swap proposal modal with AI icebreaker
│   │   │   ├── ReviewModal.jsx          # Star rating & feedback modal
│   │   │   ├── RoadmapModal.jsx         # 4-stage AI learning syllabus modal
│   │   │   ├── ScheduleModal.jsx        # Learning session appointment scheduler
│   │   │   └── StarRating.jsx           # Reusable interactive & display star rating
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Authentication & user state provider
│   │   ├── pages/
│   │   │   ├── Chat.jsx                 # Real-time chat & video launcher
│   │   │   ├── Discover.jsx             # Peer discovery, search & categories
│   │   │   ├── Home.jsx                 # Landing page
│   │   │   ├── Login.jsx                # Login view
│   │   │   ├── Profile.jsx              # Edit skills, AI bio & review stats
│   │   │   ├── PublicProfile.jsx        # Member public view & connect button
│   │   │   ├── Register.jsx             # Sign up view
│   │   │   ├── Sessions.jsx             # Calendar dashboard & video classrooms
│   │   │   └── SwapRequests.jsx         # Incoming & outgoing requests dashboard
│   │   ├── App.css
│   │   ├── App.jsx                      # Route definitions & protected routes
│   │   ├── index.css                    # Glassmorphic global theme & variables
│   │   └── main.jsx                     # React entry point
│   ├── package.json
│   └── vite.config.js                   # Vite configuration
│
├── .github/
│   └── workflows/
│       └── deploy.yml                   # GitHub Actions CI/CD for GitHub Pages
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v18.x or later recommended, v20+ supported)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (e.g. `mongodb://localhost:27017/skillswap`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.
- [npm](https://www.npmjs.com/) or `pnpm`/`yarn`

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create or verify your `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skillswap
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the backend server:
   - **Development mode** (with nodemon auto-restart):
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```

   The backend will be running at `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 📡 API Reference

All protected endpoints require the header:  
`Authorization: Bearer <your_jwt_token>`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user with skills and bio | No |
| `POST` | `/api/auth/login` | Authenticate with email & password | No |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users` | List swappers with aggregate ratings | Yes |
| `GET` | `/api/users/profile` | Retrieve currently authenticated user's profile | Yes |
| `PUT` | `/api/users/profile` | Update profile (skills offered/wanted, bio, name) | Yes |
| `GET` | `/api/users/:id` | Fetch public profile and ratings by user ID | Yes |

### Swap Requests (`/api/swaps`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/swaps` | Propose a new skill swap request | Yes |
| `GET` | `/api/swaps` | Fetch user's incoming and outgoing swap requests | Yes |
| `PUT` | `/api/swaps/:id/status`| Accept or decline a swap request (`status`: `accepted` \| `declined`) | Yes |
| `GET` | `/api/swaps/status/:userId` | Check current connection status with another user | Yes |
| `DELETE` | `/api/swaps/:id` | Cancel/withdraw a pending swap request | Yes |

### Learning Sessions (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/sessions` | Fetch user's upcoming and past learning sessions | Yes |
| `POST` | `/api/sessions` | Schedule session with instant virtual video room | Yes |
| `PUT` | `/api/sessions/:id` | Update session (status: `completed` \| `cancelled`, reschedule) | Yes |
| `DELETE` | `/api/sessions/:id` | Cancel/remove a scheduled session | Yes |

### Reviews & Ratings (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/reviews` | Submit 1-5 star review and endorsement comment | Yes |
| `GET` | `/api/reviews/user/:userId` | Fetch reviews, average rating & distribution for a user | Yes |
| `GET` | `/api/reviews/my` | Fetch reviews received by authenticated user | Yes |

### AI Assistant (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/enhance-bio` | Generate polished bio tailored to skills and tone | Yes |
| `POST` | `/api/ai/roadmap` | Generate 4-stage mutual learning curriculum | Yes |
| `POST` | `/api/ai/icebreaker` | Generate personalized swap proposal message | Yes |

### Messages (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/messages/connections` | Retrieve matched connections with accepted swap status | Yes |
| `GET` | `/api/messages/:conversationId` | Retrieve chat message history for a conversation | Yes |
| `POST` | `/api/messages` | Post a new message in a conversation | Yes |

---

## ⚡ Real-Time WebSocket Events (Socket.io)

The Socket.io server runs directly alongside the Express HTTP server on the configured backend port (`5000`).

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `authenticate` | Client ➔ Server | `{ user: { _id, name, email } }` | Maps user ID and socket ID, tracks active users. |
| `connected-users`| Server ➔ Client | `Array<{ id, name, email }>` | Broadcasts updated list of online users. |
| `send-message` | Client ➔ Server | `{ receiverId, conversationId, text, sender, ... }` | Emits a real-time message to recipient. |
| `new-message` | Server ➔ Client | `{ _id, conversationId, sender, text, createdAt }` | Delivers an incoming message to targeted recipient. |
| `notify-user` | Client ➔ Server | `{ targetUserId, type, data }` | Relays notification events (swaps, sessions) to target. |
| `notification` | Server ➔ Client | `{ type, data, timestamp }` | Pushes real-time notification alerts to client. |
| `disconnect` | Client ➔ Server | — | Deregisters user socket and updates online users list. |

---

## 🔐 Environment Variables

| Variable | Scope | Description | Example |
|---|---|---|---|
| `PORT` | Backend | HTTP & WebSocket server port | `5000` |
| `MONGODB_URI` | Backend | MongoDB database connection string | `mongodb://localhost:27017/skillswap` |
| `JWT_SECRET` | Backend | Secret key used to sign and verify JWT tokens | `your_secret_key` |
| `GEMINI_API_KEY`| Backend | Google Gemini AI API key for AI features | `AIzaSy...` |

---

## 🚢 CI/CD & Deployment

The repository includes a GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
- Automatically triggers on pushes to the `main` branch.
- Sets up Node.js v22.
- Builds the Vite production bundle into `frontend/dist`.
- Deploys the static client to **GitHub Pages**.

---

## 🗺️ Roadmap & Completed Features

- [x] **WebRTC Screen Sharing & Video Calls**: 1-click video classrooms powered by Jitsi Meet directly from chat and sessions.
- [x] **AI-Powered Bio & Skill Recommendations**: Google Gemini AI assistant for bios, 4-stage learning roadmaps, and icebreakers.
- [x] **Session Scheduling**: Integrated calendar dashboard to book, track, and complete swap sessions.
- [x] **Feedback & Reviews**: 5-star post-swap rating system and endorsements to build community trust.
- [x] **Notification Center**: Real-time navbar notification bell for pending swap proposals and upcoming sessions.
- [x] **Advanced Discovery Filters**: Instant search, category filters (Tech, Design, Languages, Music, Business), and rating sorting.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

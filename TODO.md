# 📋 SkillSwap - Feature Roadmap & TODO List

> Actionable backlog of standout features designed to elevate SkillSwap into an industry-grade, portfolio-defining peer-learning platform.

---

## 🎯 Current Status Overview

- [x] **JWT Authentication & Protected Endpoints** (`bcryptjs`, Bearer tokens)
- [x] **Smart Discovery & Mutual Match Tagging** ("Perfect Match!" reciprocal detection)
- [x] **Real-Time 1-on-1 Chat** (Socket.io WebSocket messaging & online presence)
- [x] **Interactive Swap Proposal Modal** (Custom skill selection + AI icebreakers)
- [x] **Session Calendar & Scheduling** (Time slots, durations, topics & notes)
- [x] **Instant 1-Click WebRTC Video Rooms** (Jitsi Meet video, mic, & screen sharing)
- [x] **5-Star Community Ratings & Endorsements** (Verified reviews & dynamic rating calculation)
- [x] **In-App Notification Center** (Navbar bell with unread badges & 1-click actions)
- [x] **Google Gemini AI Integration** (Bio enhancer, 4-stage mutual learning syllabus, icebreakers)
- [x] **Modern Light Mode Resurfacing** (WCAG AA compliant, Plus Jakarta Sans, frosted light glass)
- [x] **Clean Root Base URL** (Fixed Vite base path and seamless browser refresh)
- [x] **TimeBank Skill Credits Economy** (3 welcome credits, ledger transactions, credit-based booking)
- [x] **1-Click Google Calendar & `.ics` Sync** (Instant calendar addition + RFC 5545 download)
- [x] **AI Post-Session Recap & Homework Tasks** (Gemini AI concept summary & interactive checklist)
- [x] **Verifiable Skill Badges & Learner Passport** (`/passport/:userId` public verification & LinkedIn sharing)
- [x] **Rich Resource & Code Snippet Drop in Chat** (Syntax code formatting, copy button, link previews)
- [x] **Collaborative Live Code Sandbox & Digital Whiteboard** (Real-time synced multi-language code runner + HTML5 canvas whiteboard)
- [x] **Skill Circles & Community Group Workshops** (Small cohort interactive masterclasses, RSVP capacity management, Jitsi video & Live Lab integration)

---

## 🚀 Standout Features Backlog

### 1. 🪙 "TimeBank" Skill Credits Economy
> *Solves the "double coincidence of wants" dilemma where User A and User B cannot trade directly.*

- [x] **Data Model & Balance Tracking**:
  - [x] Add `skillCredits` field (Number, default `3`) to `User` schema.
  - [x] Create `CreditTransaction` schema (`sender`, `receiver`, `amount`, `type`: `'session_payment' | 'signup_bonus' | 'direct_transfer'`, `sessionRef`, `timestamp`).
- [x] **Credit Lifecycle**:
  - [x] Award 3 free credits upon new user registration.
  - [x] Transfer 1 credit from learner upon completing a learning session; transfer +1 credit to teacher.
  - [x] Display real-time credit balance badge in Navbar.
- [x] **Backend Endpoints (`/api/credits`)**:
  - [x] `GET /api/credits/balance` — Current user's credit balance and transaction history.
  - [x] `POST /api/credits/transfer` — Internal ledger transfer upon session completion or direct exchange.
- [x] **Frontend UI**:
  - [x] Credit wallet pill in Navbar with coin icon and modal view (`CreditModal.jsx`).
  - [x] "Pay with 1 Skill Credit" or "Direct Barter" option in Swap Proposal Modal (`ProposalModal.jsx`).
  - [x] Transaction history ledger modal displaying incoming and outgoing credit transfers.

---

### 2. 📅 1-Click "Add to Google Calendar" & `.ics` Sync
> *Prevents session no-shows and brings Calendly-like scheduling professionalism.*

- [x] **Calendar Link Generator**:
  - [x] Created frontend utility `src/utils/calendar.js` generating Google Calendar template URLs:
    ```
    https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}&details={notes}&location={meetingLink}
    ```
- [x] **RFC 5545 `.ics` Export**:
  - [x] Added 1-click `.ics` download button on scheduled session cards for Apple Calendar and Outlook.
- [x] **UI Integration**:
  - [x] "Add to GCal" button on scheduled session cards in `Sessions.jsx`.
  - [x] Direct download button for `.ics` calendar files.

---

### 3. 🤖 AI Post-Session Action Plan & Practice Homework Generator
> *Transforms a live call into lasting learning retention with Gemini AI.*

- [x] **Backend Endpoint (`/api/ai/session-recap`)**:
  - [x] `POST /api/ai/session-recap` — Accepts `skillTopic`, `notes`, `partnerName`.
  - [x] Prompts Google Gemini (with smart fallback) to return structured JSON:
    - `summary`: Bulleted key concepts covered.
    - `homework`: 3 practical hands-on exercises/challenges.
    - `resources`: Curated free documentation and tools.
- [x] **Frontend UI (`SessionRecapModal.jsx`)**:
  - [x] "✨ AI Recap & Tasks" button on completed sessions in `Sessions.jsx`.
  - [x] Interactive homework checklist modal where learners can tick off completed practice tasks.
  - [x] "Copy Summary" button to easily save notes to clipboard.

---

### 4. 🏆 Verifiable Skill Badges & Shareable Learner Passport
> *Adds viral acquisition and portfolio credibility to showcase verified knowledge exchange.*

- [x] **Milestone & Badge Engine**:
  - [x] Defined unlockable achievements:
    - 🔄 *First Swap Completed*
    - ⭐ *Top-Rated Mentor* (4.5+ star rating)
    - 🎓 *Multi-Disciplinarian* (Competencies across multiple domains)
    - 🪙 *TimeBank Citizen* (Credit economy participant)
- [x] **Public Learner Passport (`/passport/:userId`)**:
  - [x] Public verification page displaying verified skills, rating stats, and milestone badges.
- [x] **Social Sharing**:
  - [x] 1-click "Share on LinkedIn" and "Copy Verification Link" buttons.
  - [x] Direct passport access buttons on `Profile.jsx` and `PublicProfile.jsx`.

---

### 5. 📎 Rich Resource & Code Snippet Drop in Chat
> *Streamlines sharing study materials directly without leaving the app.*

- [x] **Syntax-Highlighted Code Blocks**:
  - [x] Detect markdown code blocks (e.g. ```javascript ... ```) inside chat messages and render with syntax container and 1-click copy button.
- [x] **Resource Links in Messages**:
  - [x] Clickable external links with proper `target="_blank"` and high-contrast styling.
- [x] **Code Insert Shortcut**:
  - [x] Dedicated `<Code />` button in chat composer to quickly insert boilerplate snippet templates.

---

### 6. 📝 Collaborative Live Code Sandbox & Digital Whiteboard
> *Enables swappers to code and sketch together live during video learning sessions.*

- [x] **Collaborative Code Sandbox (`Workspace.jsx`)**:
  - [x] Multi-language support (JavaScript ES6, HTML5/CSS, Python, SQL, Markdown) with starter templates.
  - [x] Sandboxed client-side execution terminal with execution timing (ms) and error diagnostics.
  - [x] Live HTML/CSS interactive iframe preview renderer.
  - [x] Real-time Socket.io code synchronization (`workspace-code-update` / `workspace-code-sync`) across paired partners.
  - [x] Tab indentation support, line numbers column, 1-click copy, and file download (`.js`, `.py`, `.html`, etc.).
- [x] **Collaborative Digital Whiteboard (`Workspace.jsx`)**:
  - [x] Responsive high-DPI HTML5 canvas whiteboard with freehand Pen, Highlighter, Eraser, Line, Rectangle, and Circle tools.
  - [x] 8-swatch vibrant color palette and multi-step stroke thickness selectors.
  - [x] Real-time stroke streaming and synchronized canvas clear over Socket.io (`workspace-draw-update`, `workspace-clear-canvas`).
  - [x] 1-click PNG image export (`Save Board (PNG)`) for study notes and architecture diagrams.
- [x] **Integration & Navigation**:
  - [x] Added `/workspace` and `/workspace/:roomId` routes in `App.jsx`.
  - [x] Added "Live Lab" in Navbar, Chat header, and Session cards.

---

### 7. 👥 Skill Circles / Community Group Workshops
> *Scales 1-on-1 swapping to small interactive cohort masterclasses.*

- [x] **Data Model (`Workshop.js`)**:
  - [x] `host`, `title`, `description`, `skillCategory`, `level`, `scheduledAt`, `duration`, `maxAttendees`, `attendees`, `meetingLink`, `workspaceRoomId`, `status`, `tags`.
- [x] **Backend Endpoints (`/api/workshops`)**:
  - [x] `GET /api/workshops` — List upcoming open community workshops with search, category filtering, and intelligent auto-seeding.
  - [x] `POST /api/workshops` — Host creates a new workshop with instant video room & collaborative lab room generation.
  - [x] `POST /api/workshops/:id/rsvp` — Attendee reserves a seat or toggles cancellation with strict capacity limit enforcement.
  - [x] `DELETE /api/workshops/:id` — Host can cancel workshop.
- [x] **Frontend UI (`Workshops.jsx` & `HostWorkshopModal.jsx`)**:
  - [x] Responsive directory with category filters, search input, and sub-tabs ("All Circles", "My RSVPs", "Hosted by Me").
  - [x] Visual capacity bar (filled seats / max capacity) with color-coded remaining spot alerts.
  - [x] 1-Click "Join Video Room", "Open Live Lab", and "Add to Google Calendar" integrations.
  - [x] "Host a Skill Circle" modal with validation, capacity limits, and instant publish.
  - [x] Direct navigation via "Circles" link in Navbar.

---

*Last Updated: November 2026*

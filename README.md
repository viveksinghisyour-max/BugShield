<div align="center">

<img src="https://img.shields.io/badge/BugShield-AI%20Security%20Scanner-3B82F6?style=for-the-badge&logo=shield&logoColor=white" alt="BugShield" />

# BugShield — AI-Powered Vulnerability Detection Platform

**Scan your code for security vulnerabilities, exposed secrets, and dependency risks in seconds.**  
Get AI-generated fix suggestions and professional security reports — all from a beautiful cybersecurity dashboard.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat)](LICENSE)

</div>

---

## ✨ Overview

BugShield is a full-stack cybersecurity mini-project that looks and feels like a real SaaS platform. It combines static code analysis, AI-style fix suggestions, and a premium dark-themed dashboard inspired by tools like **Snyk**, **Datadog**, and **CrowdStrike Falcon**.

---

## 🔥 Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Scanner Engine** | Detects 50+ vulnerability types — SQL injection, XSS, CSRF, command injection, path traversal, weak crypto, and more |
| 🔑 **Secret Detection** | Finds hardcoded API keys, tokens, and passwords using regex + entropy analysis |
| 📦 **Dependency Scanner** | Checks `requirements.txt`, `package.json`, and `pom.xml` for vulnerable packages |
| 📊 **Security Dashboard** | Animated circular score meter, Chart.js analytics, activity timeline |
| 🖥️ **Terminal Scan View** | Real-time animated terminal log while your project is being scanned |
| 🃏 **Vulnerability Cards** | Each finding shown as a card with expandable code preview (red → green fix) |
| 🔔 **Notification System** | Header bell with real-time critical vulnerability alerts |
| 📄 **Report Export** | Download PDF, JSON, or CSV security reports |
| 🌐 **Landing Page** | Startup-quality homepage with hero, features, and testimonials |
| 🔒 **JWT Auth** | Secure authentication with bcrypt, role-based access (admin / developer / viewer) |

---

## 🖼️ Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/landing` | Startup homepage (public) |
| **Login** | `/login` | Glassmorphism split-panel auth |
| **Register** | `/register` | Account creation |
| **Dashboard** | `/` | Security score, charts, activity timeline |
| **Upload & Scan** | `/upload` | Drag & drop upload + terminal scan |
| **Projects** | `/projects` | Card grid with status badges and score bars |
| **Scan History** | `/history` | Vulnerability cards with code preview + severity filters |
| **Reports** | `/reports` | Export PDF / JSON / CSV |
| **Settings** | `/settings` | User profile, security score, preferences |

---

## 🗂️ Project Structure

```text
BugShield/
├── .vscode/
│   └── settings.json         # Suppresses false-positive Tailwind CSS warnings
├── backend/                  # Python FastAPI backend
│   ├── app.py                # Application entry point
│   ├── config.py             # Settings (env vars)
│   ├── database.py           # SQLite schema & helpers
│   ├── routes/
│   │   ├── auth.py           # POST /register, POST /login
│   │   ├── projects.py       # Upload & project CRUD
│   │   ├── scans.py          # Scan engine + progress + history
│   │   ├── reports.py        # PDF / JSON / CSV export
│   │   └── users.py          # Users list + notifications
│   ├── scanner/
│   │   └── engine.py         # Core AI scan engine
│   └── utils/                # Auth, file handling helpers
│
└── frontend/                 # React + Vite + TailwindCSS
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js        # Dev server locked to port 5173 (strictPort)
    └── src/
        ├── App.jsx           # Routes
        ├── styles.css        # Design system + animations
        ├── api/
        │   └── client.js     # Fetch wrapper + auth
        ├── components/
        │   ├── AppLayout.jsx       # Sidebar + header
        │   ├── SecurityMeter.jsx   # Circular SVG score gauge
        │   ├── TerminalLog.jsx     # Animated scan terminal
        │   ├── VulnerabilityCard.jsx  # Finding card + code preview
        │   ├── NotificationBell.jsx   # Header notification dropdown
        │   ├── ScanProgressBar.jsx    # Gradient progress bar
        │   ├── StatCard.jsx           # Animated stat card
        │   └── SeverityBadge.jsx      # Color-coded badge
        └── pages/
            ├── Landing.jsx       # Public homepage
            ├── Login.jsx         # Auth page
            ├── Register.jsx      # Registration
            ├── Dashboard.jsx     # Analytics hub
            ├── UploadProject.jsx # Drag & drop + scan
            ├── ScanHistory.jsx   # Findings browser
            ├── Projects.jsx      # Project manager
            ├── Reports.jsx       # Report export
            └── Settings.jsx      # User profile
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### 1. Backend

```bash
cd BugShield/backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Start the server
uvicorn app:app --reload
```

> Backend runs at **http://localhost:8000**

### 2. Frontend

```bash
cd BugShield/frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Start dev server
npm run dev
```

> Frontend always runs at **http://localhost:5173** — `strictPort` is enabled, so if 5173 is already in use the server will show an error instead of silently switching ports. Kill any existing dev server first (`Ctrl+C`).

### 3. Open in Browser

| URL | Page |
|---|---|
| http://localhost:5173/landing | 🌐 Public Landing Page |
| http://localhost:5173/register | 📝 Create Account |
| http://localhost:5173/login | 🔐 Sign In |
| http://localhost:5173/ | 📊 Dashboard (after login) |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate, returns JWT token |
| `POST` | `/upload` | Upload a project file or ZIP |
| `POST` | `/scan` | Start an AI vulnerability scan |
| `GET` | `/scan/{id}/progress` | Real-time scan progress (polling) |
| `GET` | `/scan/{id}` | Scan results + vulnerabilities |
| `DELETE` | `/projects/{id}` | Delete a project and its scan data |
| `GET` | `/projects` | List user's projects |
| `GET` | `/scan-history` | All completed scans |
| `GET` | `/dashboard` | Aggregated stats + charts data |
| `GET` | `/report` | Download PDF / JSON / CSV report |
| `GET` | `/notifications` | User notification feed (last 20) |
| `POST` | `/notifications/{id}/read` | Mark a notification as read |
| `GET` | `/users` | List all users (admin only) |

---

## 🧠 Scanner Capabilities

The AI scanner engine detects the following vulnerability categories:

- **Injection** — SQL, OS command, LDAP injection patterns
- **XSS / CSRF** — Cross-site scripting, request forgery
- **Secrets** — API keys, tokens, passwords, connection strings
- **Cryptography** — Weak algorithms (MD5, SHA1, DES), hardcoded IVs
- **Authentication** — Insecure session handling, JWT misuse
- **Dependencies** — Outdated or known-vulnerable packages
- **Path Traversal** — Unsafe file access patterns
- **Debug Mode** — Exposed debug endpoints and stack traces
- **Insecure Upload** — Unrestricted file upload vulnerabilities

**Security Score Formula:** `100 − (Critical×10) − (High×5) − (Medium×2)`

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0B1020` |
| Card Surface | `#111827` with glassmorphism |
| Primary Blue | `#3B82F6` |
| Success / Low | `#22C55E` |
| Warning / Medium | `#F59E0B` |
| High Severity | `#F97316` |
| Critical | `#EF4444` + glow animation |
| Body Font | Inter |
| Code Font | JetBrains Mono |

---

## 🛡️ Production Notes

- Replace `BUGSHIELD_JWT_SECRET` with a cryptographically random 64-character secret
- Enable HTTPS in production (use a reverse proxy like Nginx or Caddy)
- Store uploaded files outside web-accessible directories
- Switch SQLite → **PostgreSQL** for multi-user production scale
- Move background scan jobs to a task queue (Celery + Redis) for reliability
- Add rate limiting on `/login` and `/register` to prevent brute force

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLite, uvicorn |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Reports | ReportLab (PDF), csv, json |
| Frontend | React 18, Vite 6, TailwindCSS 3 |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Routing | React Router DOM v6 |

---

<div align="center">
  <sub>Built with ❤️ as a cybersecurity mini-project · © 2025 BugShield</sub>
</div>

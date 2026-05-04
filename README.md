# BugShield

BugShield is an AI-powered code security scanner platform for students, developers, small teams, and startups. It provides project uploads, static security scanning, dependency vulnerability checks, scan history, dashboard analytics, and downloadable reports.

## Features

- JWT authentication with bcrypt password hashing
- Roles: admin, developer, viewer
- ZIP and source-file upload with secure extraction
- Modular scanner engine:
  - secret scanner with regex and entropy detection
  - dependency scanner for `requirements.txt`, `package.json`, and `pom.xml`
  - OWASP-style scanner for SQL injection, command injection, XSS, weak crypto, path traversal, insecure uploads, and debug mode
- AI-style vulnerability explanations, risk descriptions, fix recommendations, and secure code examples
- Security score formula: `100 - Critical*10 - High*5 - Medium*2`
- Scan history and progress tracking
- Dashboard with cards and Chart.js charts
- PDF, JSON, and CSV report generation
- Docker-ready deployment

## Project Structure

```text
bugshield/
├ backend/
│  ├ app.py
│  ├ routes/
│  ├ scanner/
│  ├ reports/
│  └ utils/
├ frontend/
│  ├ src/
│  ├ components/
│  └ pages/
├ database/
├ reports/
└ docker-compose.yml
```

## Local Backend Setup

```bash
cd bugshield/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload
```

Backend runs at `http://localhost:8000`.

## Local Frontend Setup

```bash
cd bugshield/frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Docker Setup

```bash
cd bugshield
docker compose up --build
```

## API Endpoints

- `POST /register`
- `POST /login`
- `POST /upload`
- `POST /scan`
- `GET /scan/{scan_id}/progress`
- `GET /scan/{scan_id}`
- `GET /projects`
- `GET /scan-history`
- `GET /dashboard`
- `GET /report?scan_id=1&report_type=pdf`

## Production Notes

- Replace `BUGSHIELD_JWT_SECRET` with a long random secret.
- Use HTTPS in production.
- Store uploads outside web-accessible folders.
- Consider moving scan jobs to a queue such as Celery/RQ for multi-user scale.
- Replace SQLite with PostgreSQL for production SaaS usage.

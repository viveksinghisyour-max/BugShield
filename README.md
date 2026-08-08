<div align="center">

<img src="https://img.shields.io/badge/BugShield-AI%20Security%20Scanner-3B82F6?style=for-the-badge&logo=shield&logoColor=white" alt="BugShield" />

# BugShield — AI-Powered Vulnerability Detection Platform

**Scan your code for security vulnerabilities, exposed secrets, and dependency risks in seconds.**  
Get NVIDIA AI-generated fix suggestions, interactive security assistant chat, and professional security reports — all from a modern dark-themed cybersecurity dashboard.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![NVIDIA API](https://img.shields.io/badge/NVIDIA%20API-Nemotron--3--Ultra-76B900?style=flat&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat)](LICENSE)

</div>

---

## ✨ Overview

BugShield is an enterprise-grade AI-powered cybersecurity platform built to inspect source code, locate vulnerabilities, analyze risk severity, and provide AI-generated remediation guidance. Inspired by modern SaaS platforms like **Snyk**, **Datadog**, and **CrowdStrike Falcon**, BugShield combines static code analysis with **NVIDIA Nemotron-3 Ultra LLM** intelligence to offer deep security analysis, an interactive security chatbot, and comprehensive reporting.

---

## 🔥 Key Features

| Feature | Description |
|---|---|
| 🤖 **NVIDIA AI Security Engine** | Powered by `nvidia/nemotron-3-ultra-550b-a55b` with deep thinking reasoning to generate vulnerability explanations, risk analysis, and secure code fixes |
| 💬 **BugShield AI Assistant** | Floating interactive security chat widget providing contextual guidance for specific vulnerability findings and secure coding practices |
| 🔑 **Secret Detection** | Detects hardcoded API keys, private keys, tokens, and passwords using regular expression pattern matching and entropy analysis |
| 📦 **Dependency Risk Analysis** | Inspects `requirements.txt`, `package.json`, and `pom.xml` manifest files for vulnerable dependencies and outdated packages |
| 📊 **Interactive Analytics** | Animated circular security score gauge, Chart.js risk distribution charts, severity trends, and project activity timelines |
| 🃏 **Vulnerability Remediation Cards** | Visual issue cards featuring side-by-side code previews (vulnerable snippet → secure fix example) and severity tags |
| 🔒 **Role-Based Access Control (RBAC)** | Multi-tier authorization supporting **Admin**, **Developer**, and **Viewer** roles with dedicated User Management and Activity Audit logs |
| 🔔 **Real-Time Security Feed** | Header notification center alerting users to critical findings, newly uploaded projects, and scan completions |
| 📄 **Multi-Format Export** | Professional PDF security reports with score summaries alongside JSON and CSV exports |

---

## 🖼️ Application Structure & Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Startup homepage featuring platform overview, feature highlights, and interactive showcase |
| **Sign In** | `/login` | Glassmorphism authentication panel |
| **Register** | `/register` | Account registration with automatic developer role assignment |
| **Dashboard** | `/dashboard` | Central command center showing security score, threat trends, severity breakdown, and activity timeline |
| **Upload & Scan** | `/dashboard/upload` | Drag-and-drop file upload (`.zip`, `.py`, `.js`, `.ts`, `.java`, `.env`, `.json`) or repository URL scanning |
| **Projects** | `/dashboard/projects` | Project workspace management showing project health badges, security scores, and quick scan triggers |
| **Scan History** | `/dashboard/history` | Historical vulnerability findings browser with severity filtering and AI remediation previews |
| **Reports** | `/dashboard/reports` | Report export center for PDF, JSON, and CSV downloads |
| **User Management** | `/dashboard/users` | Admin panel for managing user roles, user promotion, and viewing activity audit trails |
| **Settings** | `/dashboard/settings` | User profile management, password updates, and security preferences |

---

## 🧠 Scanner Capabilities & Scoring Model

### Detected Vulnerability Categories
- **Injection Attacks**: SQL Injection, OS Command Injection, LDAP Injection, Path Traversal
- **Web Application Risks**: Reflected & Stored XSS, CSRF, Unrestricted File Uploads, Open Redirects
- **Secrets & Credentials**: Hardcoded API Keys, Passwords, Private Keys, JWT Tokens, Connection Strings
- **Cryptographic Weaknesses**: Weak Hashing (MD5, SHA-1), Hardcoded Salts/IVs, Insecure Randomness
- **Authentication & Authorization**: Insecure Session Management, Weak JWT Verification, Missing RBAC Checks
- **Software Supply Chain**: Outdated & Vulnerable Dependencies in Python, Node.js, and Java manifests

### Security Score Formula
$$\text{Security Score} = \max\Big(0,\, 100 - (10 \times \text{Critical}) - (5 \times \text{High}) - (2 \times \text{Medium})\Big)$$

---

## 🔒 Role-Based Access Control (RBAC)

BugShield strictly enforces role permissions across the backend API and frontend views:

* **Admin**: Full control — manage user roles, view all user activity audit logs, delete projects, trigger scans, and view system analytics.
* **Developer**: Standard developer access — upload code repositories, initiate scans, view assigned projects, and query the AI Chatbot.
* **Viewer**: Read-only access — inspect assigned project findings and download security reports.

---

## 🔌 Backend API Specification

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | User account registration |
| `POST` | `/login` | Authenticates user and returns JWT bearer token |
| `POST` | `/upload` | Uploads project source files, ZIP archives, or repository links |
| `POST` | `/scan` | Triggers static scan engine and NVIDIA AI vulnerability analysis |
| `GET` | `/scan/{id}/progress` | Fetches real-time scan completion status |
| `GET` | `/scan/{id}` | Retrieves scan results, security score, and vulnerability list |
| `POST` | `/chat` | Sends queries to BugShield AI Assistant powered by NVIDIA Nemotron |
| `GET` | `/projects` | Lists user projects with latest scan scores and status |
| `DELETE` | `/projects/{id}` | Deletes project record, storage files, and scan history |
| `GET` | `/scan-history` | Lists all historical scan executions |
| `GET` | `/dashboard` | Returns aggregated metrics, threat distributions, and trend data |
| `GET` | `/report` | Generates and streams downloadable PDF, JSON, or CSV reports |
| `GET` | `/notifications` | Retrieves user's notification feed |
| `POST` | `/notifications/{id}/read` | Marks a specific notification as read |
| `GET` | `/users` | Lists system users and audit info (Admin only) |

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology & Tools |
|---|---|
| **AI Engine** | NVIDIA NIM API (`nvidia/nemotron-3-ultra-550b-a55b`), OpenAI Python SDK |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & Auth** | SQLite, PyJWT (HS256), Passlib / Bcrypt password hashing |
| **Reporting** | ReportLab PDF Engine, CSV, JSON |
| **Frontend Framework** | React 18, Vite 6, React Router DOM v6 |
| **Styling & Icons** | Vanilla CSS Design System, TailwindCSS 3, Lucide React Icons |
| **Data Visualization** | Chart.js, React-ChartJS-2 |

---

<div align="center">
  <sub>Built with ❤️ for AI-driven application security · BugShield Platform</sub>
</div>

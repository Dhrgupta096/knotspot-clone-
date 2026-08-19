# 🎓 DSU KnotSpot — Dayananda Sagar University Campus Super-App

[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20%7C%20Mobile-blue.svg)](https://github.com/Dhrgupta096/knotspot-clone-)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Database](https://img.shields.io/badge/Database-SQLite3-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8.svg?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **The all-in-one student social and campus utility hub engineered exclusively for Dayananda Sagar University (DSU).**
> Connect with classmates across KS Layout & Harohalli campuses, find flatmates & PGs with student privacy shields, share anonymous rants, study notes, and track annual university fests like **DERBY 2026**.

---

## 🌟 Key Features

| Module | Features & Capabilities |
|---|---|
| **📌 Knots Forum** | Branch & campus filtered discussion threads (`Academics`, `Coding`, `Campus Life`, `General`), upvotes, starred bookmarks, real-time comments drawer, and thread search. |
| **🤫 Anonymous Confessions** | Zero-trace student anonymity, fun aliases (`Silent Cadet`, `Ghost Coder`), animated multi-emoji reactions (❤️, 🔥, 💀, 😭), reply drawer, and automated pre-moderation filter. |
| **🛏️ Room Finder & Flatmate Match** | Dynamic **🔥 Match Score** algorithm (branch, campus, budget, gender), verified `@dsu.edu.in` email inquiries, masked phone numbers (anti-scraping), and 1-click WhatsApp connect. |
| **🎉 Events & Fest Tracker** | Real-time countdowns for **DERBY 2026**, **AIC-DSU 36h Hackathon**, **SPARDHA Sports Cup**, live RSVP counter, **Google Calendar direct sync**, and Apple/Outlook `.ics` downloads. |
| **🔑 Student Authentication** | Google Identity Services (GSI) / OAuth 2.0 integration, 1-Click Fast Student Demo login, and custom `@dsu.edu.in` student profile generator. |
| **🛡️ Student Safety & Moderation** | Automated anti-doxxing filter (blocks phone numbers in confessions), hate speech shield, `🚩 Report Content` system, and community safety guidelines. |
| **📱 Progressive Web App (PWA)** | Offline-first Service Worker cache (`sw.js`), native mobile app experience, installable to Home Screen on iOS (Safari) and Android (Chrome). |
| **🤖 J.A.R.V.I.S. Core Assistant** | Standalone high-tech HUD interface with real-time macOS CPU/RAM/Battery telemetry, audio spectrum visualizer, and voice speech recognition on port `8765`. |

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |    DSU Student Client (Browser/PWA)   |
                                  +---------------------------------------+
                                         |                         |
               Static Asset / PWA Cache  |                         | REST API Calls
                     (sw.js / Port 3000) |                         | (Port 5000)
                                         v                         v
                          +--------------------+         +-----------------------+
                          |   Frontend Server  |         |   Python REST API     |
                          | (http.server:3000) |         | (server/server.py:5000)
                          +--------------------+         +-----------------------+
                                                                   |
                                                         SQL Queries / Transactions
                                                                   |
                                                                   v
                                                         +-----------------------+
                                                         |  SQLite DB (knotspot) |
                                                         | - users, knots, rooms |
                                                         | - confessions, events |
                                                         | - reports & comments  |
                                                         +-----------------------+
```

---

## 📂 Repository Structure

```
dsu-knotspot/
├── index.html                 # Main Landing Page with Hero, Features & Google Auth Modal
├── start.sh                   # Auto-detecting multi-device local launch script
├── sw.js                      # Service Worker caching engine for Offline PWA
├── manifest.json              # Web App Manifest for mobile installation
├── Dockerfile                 # Containerization specification
├── Procfile                   # Cloud process file for Render / Railway
├── requirements.txt           # Python dependencies
│
├── knots/                     # Campus Discussion Forum
│   └── index.html
├── confessions/               # Anonymous Student Confessions & Emoji Reactions
│   └── index.html
├── roomfinder/                # Privacy-Protected Roommate & PG Matcher
│   └── index.html
├── events/                    # Campus Fests, Calendar Sync & RSVP Tracker
│   └── index.html
│
├── server/                    # Python Backend & SQLite Database Engine
│   ├── server.py              # Lightweight REST API server (port 5000)
│   ├── database.py            # SQLite schema migrations & realistic DSU seed data
│   └── knotspot.db            # Persistent SQLite database file
│
├── static/
│   ├── css/                   # Design tokens, themes & responsive layouts
│   ├── js/
│   │   ├── app.js             # Global auth, toast notifications & modal manager
│   │   ├── db.js              # Hybrid data layer (LocalStorage + REST API Sync)
│   │   ├── theme.js           # Dark/Light mode theme switcher
│   │   └── moderation.js      # Anti-doxxing, content filter & report system
│   └── images/                # App icons & badges
│
└── jarvis/                    # J.A.R.V.I.S. HUD Core Assistant & Telemetry
    ├── index.html             # Sci-Fi canvas visualizer & telemetry display
    ├── jarvis_telemetry.py    # WebSocket system monitor (port 8765)
    └── start_jarvis.sh
```

---

## 🔌 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check & service status |
| `/api/user` | `POST` | Create or update student profile |
| `/api/auth/google` | `POST` | Verify Google ID token against Google OAuth endpoints |
| `/api/logout` | `POST` | Safe user session termination |
| `/api/knots` | `GET` / `POST` | Retrieve all discussion threads / Publish a new thread |
| `/api/knots/upvote` | `POST` | Toggle thread upvote with duplicate prevention |
| `/api/knots/star` | `POST` | Bookmark/star a thread |
| `/api/knots/comments` | `GET` / `POST` | Retrieve or submit comments for a thread |
| `/api/confessions` | `GET` / `POST` | Retrieve anonymous confessions / Submit new confession |
| `/api/confessions/react`| `POST` | Add/toggle emoji reaction (`heart`, `fire`, `skull`, `cry`) |
| `/api/confessions/comments`| `GET` / `POST` | Retrieve or post anonymous replies to a confession |
| `/api/rooms` | `GET` / `POST` | Fetch roommate & PG listings / Publish new room vacancy |
| `/api/events` | `GET` | List all campus events, fests, and hackathons |
| `/api/events/rsvp` | `POST` | Toggle RSVP status for an event |
| `/api/reports` | `GET` / `POST` | Submit a content moderation report / Fetch pending reports |

---

## ⚡ Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Dhrgupta096/knotspot-clone-.git
cd knotspot-clone-
```

### 2. Launch Locally (1 Command)
```bash
bash start.sh
```
This automatically:
* Seeds the SQLite database with authentic Dayananda Sagar University data.
* Launches the Python REST API server on `http://localhost:5000`.
* Launches the Frontend Web Server on `http://localhost:3000`.
* Displays your LAN Wi-Fi IP (e.g. `http://10.1.7.54:3000`) for mobile testing.

---

## 🌐 1-Click Cloud Deployment

### Deploy Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com) and import `knotspot-clone-`.
2. Click **Deploy**. Vercel will deploy the site live with global CDN in 15 seconds.

### Deploy Backend on Render:
1. Go to [render.com](https://render.com) $\rightarrow$ **New Web Service** $\rightarrow$ select `knotspot-clone-`.
2. Set Runtime to `Python 3` and Start Command to `python3 server/server.py`.

---

## 🛡️ Privacy & Safety Model
* **Student Privacy Shield:** Personal mobile numbers are masked. Students connect through authenticated `@dsu.edu.in` emails or mutual WhatsApp handshakes.
* **Anti-Doxxing Pre-Filter:** Prevents phone numbers and room numbers from being posted in anonymous confessions.
* **Student Moderation:** Posts can be reported in 1 click and hidden pending review.

---

## 📄 License
This project is licensed under the MIT License — open for the Dayananda Sagar University student community.

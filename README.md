# 🎓 DSU KnotSpot

> **A student community platform built for Dayananda Sagar University (DSU) students across Kumaraswamy Layout & Harohalli campuses.**

KnotSpot is a college web app designed to solve real daily problems students face at DSU: finding flatmates and PGs without leaking personal contact info, discussing academics and placements, sharing campus thoughts anonymously without cyberbullying, and staying updated on university fests like **DERBY** and **AIC-DSU Hackathons**.

---

## 🌐 Live Access & Links

* **GitHub Repository:** [https://github.com/Dhrgupta096/knotspot-clone-](https://github.com/Dhrgupta096/knotspot-clone-)
* **Local / College Wi-Fi Access:** Run `bash start.sh` on your laptop to open `http://localhost:3000` (or share the displayed Wi-Fi IP `http://10.x.x.x:3000` with friends on campus).

---

## 📌 Why I Built This (The Real Problems at DSU)

| Real Student Problem | How KnotSpot Solves It |
|---|---|
| **Finding Roommates in KS Layout / Harohalli:** Students constantly spam WhatsApp batches and unofficial groups looking for flatmates, which leads to phone numbers getting leaked to random brokers. | **Privacy-Shield Room Finder:** Student phone numbers are protected. Students connect safely using their verified `@dsu.edu.in` college email or verified mutual WhatsApp. Includes a match score based on campus, branch, and budget. |
| **Anonymous Confessions without Doxxing:** College confession pages on Instagram often lead to toxic doxxing, harassment, or students' phone numbers being posted publicly. | **Anti-Doxxing Pre-Filter & Report System:** A regex content filter automatically blocks phone numbers and abusive text before posting. Plus a 1-click report button for students to flag harmful posts. |
| **Branch & Campus Discussions (Knots):** First years and seniors need a clean place to ask about internals, lab exams, electives, coding problems, and college shuttle timings. | **Knots Forum:** Category-filtered threads (`Academics`, `Coding`, `Campus Life`, `General`) with upvotes, bookmarks, and comment replies. |
| **Missing Campus Events & Deadlines:** Students often miss fest registrations, hackathon deadlines, or sports trials because notices get buried in emails. | **Events & Fest Hub:** Direct countdown timers for annual fests like **DERBY 2026** and **AIC-DSU Hackathon**, with 1-click **Add to Google Calendar** and Apple/Outlook `.ics` download. |

---

## 💻 Tech Stack (No Bloat, Fast on Mobile)

* **Frontend:** Clean Vanilla HTML5, CSS3, and JavaScript (ES6+). Zero heavy frameworks like React or Angular, so pages load in under a second even on spotty college Wi-Fi.
* **Backend:** Lightweight Python 3 REST API (`server/server.py`).
* **Database:** SQLite (`server/knotspot.db`) with real Dayananda Sagar University campus data pre-seeded.
* **PWA / Mobile:** Offline-ready Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) — installable directly to your phone's home screen on Android and iOS Safari.

---

## 📱 Features Walkthrough

### 1. 🛏️ Room & Flatmate Finder
* Search and filter PGs/hostels near **KS Layout** or **Harohalli (Kanakapura Road)**.
* Filter by rent budget (Under ₹8k, ₹8k–₹15k, ₹15k+), room type (Single, Double, Flat share), and gender preference.
* **🔥 Match Score:** Automatically calculates compatibility percentage based on your campus, branch, and budget.
* **Privacy Shield:** Masked phone numbers + 1-click pre-filled college email match request.

### 2. 🤫 Anonymous Confessions
* Share college thoughts, funny campus moments, or rants completely anonymously.
* Every post gets a random alias (e.g., *Silent Cadet*, *Ghost Coder*).
* Interactive animated reactions: ❤️, 🔥, 💀, 😭.
* Built-in moderation engine that rejects any post containing phone numbers or harassment.

### 3. 📌 Knots Forum
* Start discussion threads for exam tips, coding questions, campus transit schedules, or project team formation.
* Filter by campus and category.
* Upvote helpful answers and bookmark threads to read later.

### 4. 🎉 Events Tracker
* Live countdown timers for major DSU events (**DERBY Cultural Fest**, **AIC-DSU 36h Hackathon**, **SPARDHA Sports Cup**, **IEEE Tech-Vision**).
* 1-Click **Google Calendar Sync** (adds event date, venue, and description straight to your Google account).
* Apple / Outlook `.ics` calendar file download.
* RSVP counter showing how many DSU students are attending.

### 5. 🔑 Login Options
* **Google Sign-In:** Official Google Identity authentication.
* **Custom Profile:** Set your DSU branch (`CSE`, `AIML`, `ECE`, `B.Pharm`, etc.), year, and campus.
* **1-Click Demo Login:** Fast login for quick testing without typing credentials.

---

## 🚀 How to Run Locally

### Prerequisites
* Python 3.9+ installed on your computer.

### Quick Start (1 Command)
```bash
bash start.sh
```

This single command will:
1. Initialize the SQLite database with DSU campus seed data.
2. Start the Python REST API on `http://localhost:5000`.
3. Start the Web App on `http://localhost:3000`.
4. Show your local Wi-Fi IP address so you can open it on your phone.

Open **`http://localhost:3000`** in your browser to use KnotSpot.

---

## 📂 Project Structure

```
dsu-knotspot/
├── index.html                 # Landing page with hero, features & login modal
├── start.sh                   # 1-click startup script for both frontend & backend
├── sw.js                      # Service Worker for offline PWA caching
├── manifest.json              # Web app manifest for mobile installation
├── netlify.toml               # Deployment config for Netlify
├── Procfile                   # Process file for Render / Railway
├── requirements.txt           # Python backend dependencies
│
├── knots/                     # Knots campus forum page
│   └── index.html
├── confessions/               # Anonymous confessions page & emoji reactions
│   └── index.html
├── roomfinder/                # Roommate & PG finder with privacy protection
│   └── index.html
├── events/                    # Campus events & Google Calendar sync page
│   └── index.html
│
├── server/                    # Backend API and database
│   ├── server.py              # Python REST API server (port 5000)
│   ├── database.py            # SQLite schema & DSU seed data
│   └── knotspot.db            # Persistent SQLite database
│
└── static/
    ├── css/style.css          # Design system & dark/light mode styles
    └── js/
        ├── app.js             # Authentication, navigation & toasts
        ├── db.js              # LocalStorage + REST API data sync layer
        ├── moderation.js      # Anti-doxxing & content safety filter
        └── theme.js           # Theme switcher (Dark / Light mode)
```

---

## 🔒 Safety & Privacy Rules
* **No Doxxing:** Phone numbers and room numbers cannot be posted in confessions.
* **Student Privacy:** Personal phone numbers are masked by default in room listings.
* **Student Moderation:** Any student can flag problematic content using the `🚩 Report` button.

---

**Built with ❤️ for Dayananda Sagar University students.**

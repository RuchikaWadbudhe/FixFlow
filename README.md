# FixFlow — Issue Reporting & Resolution System

FixFlow is a structured ticketing platform built for colleges, offices, and residential communities to report, track, and resolve maintenance issues — things like broken lights, water leakage, internet problems, or damaged furniture.

Instead of reporting issues through WhatsApp groups or emails that get lost, FixFlow gives everyone a proper workflow: report an issue, get a ticket ID, watch it move through stages, and close it when it's fixed.

---

## What it does

There are three types of users — regular users, staff, and admins. Each sees a different view.

**As a user**, you can:
- Report a new issue with a title, description, location, category, priority, and optionally a photo
- Get an auto-generated ticket ID like `FF-1042`
- Track your ticket through: `Reported → Assigned → In Progress → Resolved → Closed`
- Comment on your ticket and get updates from staff
- Rate the resolution once the issue is fixed

**As a staff member**, you can:
- See all incoming tickets and accept unassigned ones
- Change ticket status as you work on it
- Add internal notes (only visible to staff) or public comments
- Upload proof of resolution with notes

**As an admin**, you can:
- See a full dashboard with stats — total issues, open, in progress, resolved, SLA breaches, average resolution time
- View charts broken down by category, priority, location, and a 7-day trend
- Assign tickets to specific staff members
- Manage users and change their roles

---

## Tech stack

- **Frontend** — React, Vite, Tailwind CSS, Recharts, React Router
- **Backend** — Node.js, Express, JWT authentication
- **Database** — PostgreSQL on Supabase
- **File uploads** — Multer (photos + resolution proofs)
- **Deployed on** — Vercel (frontend) + Render (backend)

---

## Project structure

```
FixFlow/
├── backend/
│   ├── src/
│   │   ├── db/           # Database connection, schema, migration script
│   │   ├── middleware/   # JWT auth, file upload handling
│   │   ├── routes/       # auth, tickets, admin API routes
│   │   └── index.js      # Express server entry point
│   ├── uploads/          # Stored photos and resolution proofs
│   └── .env.example      # Environment variable template
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance with interceptors
    │   ├── context/      # Auth context with JWT state
    │   ├── components/   # Shared layout and UI components
    │   └── pages/        # auth, user, staff, admin pages
    ├── .env.example
    └── vite.config.js
```

---

## Running it locally

000/api
```

Start the frontend:
```bash
npm run dev
```



---



You can also click the quick-fill buttons on the login page.

---

## SLA timers

Each priority level has a deadline:

| Priority | SLA |
|----------|-----|
| Critical | 4 hours |
| High | 24 hours |
| Medium | 48 hours |
| Low | 72 hours |

Tickets that breach their SLA are flagged in the dashboard.

---

## Deployment

- Frontend is on Vercel — set `VITE_API_URL` in project environment variables
- Backend is on Render — set all variables from `.env.example` in the service environment
- Database is on Supabase — connection string goes in `DATABASE_URL`

Live URL: https://fix-flow-iota.vercel.app

---

## Notes

- `.env` files are gitignored — never committed to the repo
- Internal comments (staff-only notes) are hidden from the ticket reporter
- The ticket ID sequence starts at FF-1000 and auto-increments
- Photos and resolution proofs are stored in `backend/uploads/` (local) — for production, consider moving to S3 or Supabase storage

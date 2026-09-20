# FixFlow — Real-Time Issue Reporting & Resolution System

A full-stack ticketing platform for colleges, offices, and residential communities to report, assign, track, and resolve maintenance issues.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS v3 |
| Backend    | Node.js + Express                 |
| Database   | PostgreSQL                        |
| Auth       | JWT (JSON Web Tokens)             |
| Charts     | Recharts                          |
| Icons      | Lucide React                      |

---

## Project Structure

```
FixFlow/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── db/       # PostgreSQL pool, schema, migration
│   │   ├── middleware/ # JWT auth, file upload (multer)
│   │   ├── routes/   # auth, tickets, admin
│   │   └── index.js  # Express app entry
│   ├── uploads/      # Uploaded photos & resolution proofs
│   └── .env          # Environment config
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/       # Axios instance
        ├── context/   # AuthContext (JWT state)
        ├── components/ # Layout, UI components
        └── pages/     # auth, user, staff, admin
```

---

## Setup & Run

### 1. PostgreSQL

Create a database named `fixflow`:

```sql
CREATE DATABASE fixflow;
```

Update `backend/.env` with your credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/fixflow
JWT_SECRET=fixflow_super_secret_jwt_key_2024
```

### 2. Run Database Migration

```bash
cd backend
npm install
node src/db/migrate.js
```

This creates all tables, triggers, and seeds 3 demo users.

### 3. Start Backend

```bash
cd backend
npm run dev     # development (nodemon)
# or
npm start       # production
```

Backend runs on: http://localhost:5000

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Demo Accounts

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@fixflow.com      | password |
| Staff | staff@fixflow.com      | password |
| User  | user@fixflow.com       | password |

---

## Features

### User
- Register / Login
- Create tickets with title, description, category, priority, location, and optional photo
- Auto-generated ticket ID (FF-1001, FF-1002, ...)
- Multi-step ticket creation form
- Track ticket: Reported → Assigned → In Progress → Resolved → Closed
- View comments and activity log
- Rate resolution (1–5 stars)

### Staff Dashboard
- View all tickets with filters (status, priority, category, search)
- One-click accept unassigned tickets
- Change ticket status
- Add user-facing or internal comments
- Upload resolution proof and notes

### Admin Dashboard
- Stats: Total, Open, In Progress, Resolved, Closed, High Priority, SLA Breached, Avg. Resolution Time
- Charts: Issues by Category (bar), Issues by Priority (pie), 7-day Trend (line), Top Locations (bar)
- Full ticket management table with assignment
- User management: view all users, change roles

### Other
- SLA timers by priority (Critical: 4h, High: 24h, Medium: 48h, Low: 72h)
- SLA breach indicators
- Internal (staff-only) comments
- Responsive design (mobile + desktop)
- Role-based access control

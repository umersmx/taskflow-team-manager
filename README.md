# TaskFlow — Team Task Manager

A full-stack Team Task Manager web application built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Auth | Passport.js (Local Strategy) + Express Session + bcrypt |
| Database | PostgreSQL |
| Session Store | `connect-pg-simple` (prod) / MemoryStore (dev) |
| Validation | `express-validator` |

## Features

- **Authentication**: Secure login/register with bcrypt password hashing and HTTP-only session cookies
- **Team Management**: Create teams, add/remove members, role-based access control (Owner/Admin/Member)
- **Task Management**: Full CRUD for tasks with status, priority, due dates, and assignments
- **Search & Filtering**: Filter tasks by team, assignee, status, priority, and text search
- **Due Date Reminders**: Dashboard alerts for overdue and upcoming tasks
- **Email Invitations**: Stubbed invitation system (records created in DB, auto-accepted on registration)
- **Role-Based Access Control**: Only owners can delete teams, only owners/admins can manage members
- **Responsive Design**: Mobile-first with collapsible sidebar and adaptive layouts
- **Premium UI**: Glassmorphism, gradient effects, micro-animations, Inter font

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ (running locally or on GCP Cloud SQL)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "full stack project"
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE team_task_manager;
```

The schema is automatically initialized when the server starts for the first time.

### 3. Configure environment variables

```bash
cp .env.example server/.env
```

Edit `server/.env` with your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/team_task_manager
SESSION_SECRET=your-random-secret-key
```

### 4. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 5. Start the development servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to `http://localhost:5000`.

## API Documentation

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Team Routes (`/api/teams`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List user's teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/:id` | Get team details |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team (owner only) |
| POST | `/api/teams/:id/members` | Add member |
| DELETE | `/api/teams/:id/members/:userId` | Remove member |
| POST | `/api/teams/:id/invite` | Invite via email |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Filters |
|--------|----------|-------------|---------|
| GET | `/api/tasks` | List tasks | `?team_id=&assigned_to=&status=&priority=&search=` |
| POST | `/api/tasks` | Create task | — |
| GET | `/api/tasks/:id` | Get task | — |
| PUT | `/api/tasks/:id` | Update task | — |
| DELETE | `/api/tasks/:id` | Delete task | — |
| GET | `/api/tasks/reminders` | Get reminders | — |

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── App.jsx            # Main app with routing
│   │   └── index.css          # Tailwind + custom styles
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── config/                # DB, Passport, Session config
│   ├── middleware/            # Auth, Roles, Validation
│   ├── routes/                # API route handlers
│   ├── validators/            # Input validation rules
│   ├── db/                    # SQL schema
│   ├── app.js                 # Express app setup
│   └── server.js              # Entry point
│
└── README.md
```

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- HTTP-only session cookies with SameSite=Lax
- All inputs validated and sanitized via express-validator
- SQL injection prevented with parameterized queries
- CORS restricted to frontend origin
- All non-auth routes protected by authentication middleware
- Role-based authorization for destructive operations

## Deployment (Google Cloud Platform)

1. Set up a **Cloud SQL PostgreSQL** instance
2. Deploy the backend to **Cloud Run** or **App Engine**
3. Build the frontend (`npm run build`) and serve static files, or deploy to **Cloud Storage** with **Cloud CDN**
4. Set environment variables in the deployment configuration
5. Update `CLIENT_URL` and CORS settings for production

## License

MIT

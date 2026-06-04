# TaskFlow — Modern Team Task Manager

TaskFlow is a premium, Nordic-minimalist full-stack task management application designed for agile teams. It enables secure team creation, granular member role hierarchies, task delegations, and smart calendar reminders.

---

## 🌟 Key Features

*   **Premium Glassmorphic UI/UX**: Crafted with dynamic gradient effects, floating particle background animations, responsive navigation sidebar, and soft, harmonic color accents.
*   **Time-Aware Dashboard**: Greets the logged-in user dynamically based on the system time and displays a rotating selection of daily developer motivation quotes.
*   **Role-Based Access Control (RBAC)**: Owner, Admin, and Member permissions control who can delete teams, assign tasks, and manage collaborators.
*   **Smart Overdue Alerts**: Distinct, pulse-animated indicators warn users of tasks past their due dates.
*   **No-Config SQLite Fallback**: Instantly runs locally out-of-the-box using SQLite if no PostgreSQL instance is detected.
*   **Neon DB Support**: Ready for serverless cloud databases in production.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Passport.js (Local Strategy), Express Session |
| **Database** | PostgreSQL (Primary) / SQLite via `better-sqlite3` (Zero-config fallback) |
| **Styling** | Vanilla CSS over Tailwind v4 utility design |

---

## 🚀 Local Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/umersmx/taskflow-team-manager.git
cd "full stack project"

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Database & Environment Setup
If you want to run with **Zero-Config SQLite (Default)**:
*   You don't need to do anything! The app automatically generates a local database file at `server/db/db.sqlite` on startup.

If you want to run with **PostgreSQL**:
1.  Create a database:
    ```sql
    CREATE DATABASE team_task_manager;
    ```
2.  Create a file named `.env` in the `server` directory and paste your connection string:
    ```env
    DATABASE_URL=postgresql://username:password@localhost:5432/team_task_manager
    SESSION_SECRET=a-secure-random-key-string
    ```

### 4. Running the Application
Open two separate terminal windows:

**Terminal 1 (Backend API)**:
```bash
cd server
npm run dev
```
*Runs on `http://localhost:5000`*

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
```
*Runs on `http://localhost:5173`*

---

## 🧪 Testing Guidelines & Existing Profiles

To test the application locally with your database, you can log in using the existing accounts you have already created (using the passwords you set during registration, e.g. `Taskflow123`):

### Existing Test Profiles
| User Name | Email | Password | Active Role | Assigned Tasks |
| :--- | :--- | :--- | :--- | :--- |
| **Muhammad Ali** | `ali@example.com` | `Password123!` | Owner | Write REST API documentation (To Do), Export branding logo SVG assets (To Do) |
| **Ayesha Khan** | `ayesha@example.com` | `Password123!` | Owner | Create typography style guide (In Progress) |
| **Hamza Ahmed** | `hamza@example.com` | `Password123!` | Member | Setup server configuration (Done) |
| **Zainab Fatima** | `zainab@example.com` | `Password123!` | Member | Design landing page mockup (Done - Overdue) |
| **Bilal Yousuf** | `bilal@example.com` | `Password123!` | Member | Integrate Passport authentication (In Progress) |

### Step-by-Step Test Walkthrough
1.  **Log in as Owner**: Sign in as `ali@example.com`. Go to **Dashboard** and view the time-aware greeting and stats. You will see the tasks inside the **Lahore Tech Hub** team.
2.  **Verify Team Management**: Open the `Lahore Tech Hub` team view. As the Owner, you can view the team members (**Hamza Ahmed**, **Bilal Yousuf**) and add/remove collaborators.
3.  **Check Notifications & Overdue Styling**: Log in as `ayesha@example.com` (Owner of `Karachi Creative Agency`). You will see the overdue task *\"Design landing page mockup\"* (assigned to Zainab Fatima) with a red pulse overdue alert indicating it was due.
4.  **Verify Member Restrictions**: Log in as `hamza@example.com` (Member of `Lahore Tech Hub`). Notice that you cannot delete the team or edit details, but you can change status filters and toggle task states.

---

## ☁️ Cloud Deployment (Vercel & Railway)

The application is deployed online and connects to a remote Neon PostgreSQL database:

*   **Production Frontend (Vercel)**: [https://taskflow-team.vercel.app/](https://taskflow-team.vercel.app/)
*   **Production Backend (Railway)**: [https://taskflow-production-11cf.up.railway.app](https://taskflow-production-11cf.up.railway.app)

### 1. Backend Service (Railway)
*   **Root Directory**: `server` (or root with script delegation)
*   **Environment Variables**:
    *   `NODE_ENV` = `production`
    *   `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
    *   `SESSION_SECRET` = *(Any secure random secret)*
    *   `CLIENT_URL` = `https://client-gamma-nine-54.vercel.app` (Your frontend Vercel URL)

### 2. Frontend App (Vercel)
*   **Root Directory**: `client`
*   **Framework Preset**: `Vite`
*   **Environment Variables**:
    *   `VITE_API_URL` = `https://taskflow-production-11cf.up.railway.app/api` (Remember to append `/api`)


---

## 📂 Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Dashboard stats, auth forms, task cards, layout
│   │   ├── contexts/           # Authentication state context
│   │   ├── pages/              # Landing, Dashboard, Team Detail, 404
│   │   ├── services/           # Axios API Client
│   │   └── index.css           # Premium Tailwind theme definitions
│   └── vercel.json             # Vercel single-page rewrite router
│
├── server/                     # Node/Express Backend
│   ├── config/                 # DB connectors, Passport, session setups
│   ├── db/                     # SQL migration schemes & SQLite file storage
│   ├── middleware/             # Role guards, validation formatters
│   ├── routes/                 # Express API routing channels
│   └── server.js               # Web server entry point
```

---

## 🔒 Security Practices
*   Passwords hashed using `bcrypt` (12 rounds).
*   Express Session cookies protected with `HttpOnly` and `SameSite` configurations.
*   Cross-Origin Resource Sharing (CORS) strictly tied to `CLIENT_URL`.
*   Parameterized SQL queries preventing SQL injections.
*   Inputs sanitized using `express-validator`.

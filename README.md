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
git clone <your-repo-url>
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

## 🧪 Testing Guidelines & Suggested Profiles

To test the role hierarchies (Owner, Admin, Member) and task assignment, we recommend registering the following three test profiles:

### Suggested Profiles
| User Role | Suggested Email | Suggested Password | Test Focus |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@taskflow.com` | `Taskflow123` | Can create teams, assign tasks, add members, promote roles, and delete the team. |
| **Admin** | `admin@taskflow.com` | `Taskflow123` | Can invite members, edit tasks, and change task status. Cannot delete the team. |
| **Member** | `member@taskflow.com` | `Taskflow123` | Can update the status of tasks assigned to them. Cannot manage members or teams. |

### Step-by-Step Test Walkthrough
1.  **Create Team**: Log in as `owner@taskflow.com`, go to the Dashboard, click **New Team**, and name it `Alpha Squad`.
2.  **Invite collaborators**: Inside `Alpha Squad`, go to the members panel and add `admin@taskflow.com` and `member@taskflow.com`.
3.  **Assign Tasks**: Create a task (e.g. *\"Design landing page mockup\"*) and assign it to the Member. Set the due date to yesterday to verify the red pulse overdue alert.
4.  **Verify Permissions**: Log in as the Member. Notice you cannot delete the team or remove other members, but you can change the task status to **In Progress** or **Done**.

---

## ☁️ Cloud Deployment (Vercel & Render)

Since this project has been fully optimized for cross-domain cookie authentication, you can deploy it to free hosting providers:

### 1. Backend Service (Render)
*   **Root Directory**: `server`
*   **Environment Variables**:
    *   `NODE_ENV` = `production`
    *   `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
    *   `SESSION_SECRET` = *(Any secure random secret)*
    *   `CLIENT_URL` = *(Your frontend Vercel URL, e.g., `https://your-app.vercel.app`)*

### 2. Frontend App (Vercel)
*   **Root Directory**: `client`
*   **Framework Preset**: `Vite`
*   **Environment Variables**:
    *   `VITE_API_URL` = `https://your-backend.onrender.com/api` (Remember to append `/api`)

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

-- ============================================
-- Team Task Manager — Database Schema
-- ============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Team Members (with roles)
CREATE TABLE IF NOT EXISTS team_members (
  id        SERIAL PRIMARY KEY,
  team_id   INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  status       VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority     VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date     TIMESTAMP,
  team_id      INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  assigned_to  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Session store (for connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR NOT NULL COLLATE "default",
  "sess"   JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Team Invitations (bonus feature)
CREATE TABLE IF NOT EXISTS team_invitations (
  id          SERIAL PRIMARY KEY,
  team_id     INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  invited_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at  TIMESTAMP DEFAULT NOW()
);

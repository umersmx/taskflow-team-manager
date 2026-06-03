const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { createSessionMiddleware } = require('./config/session');

// Import routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');

const app = express();

// Trust reverse proxy (Railway, Render, etc.) to set secure cookies
app.set('trust proxy', 1);


// ── CORS Configuration ──
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ── Body Parsing ──
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Session Middleware ──
app.use(createSessionMiddleware());

// ── Passport Initialization ──
app.use(passport.initialize());
app.use(passport.session());

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

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
const allowedOrigins = [
  'http://localhost:5173',
  'https://client-gamma-nine-54.vercel.app',
  'https://taskflow-team.vercel.app',
  'https://taskflow-production-11cf.up.railway.app'
];


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for origin: ' + origin), false);
    },
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

// Serve static files from React frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback all non-API GET requests to React's index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;


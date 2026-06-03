const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const { pool } = require('../config/db');
const { registerValidation, loginValidation } = require('../validators/auth');
const { handleValidationErrors } = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password with bcrypt (12 salt rounds)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar_url, created_at',
      [name, email, hashedPassword]
    );

    const newUser = result.rows[0];

    // Check for pending invitations and auto-accept them
    const invitations = await pool.query(
      "SELECT id, team_id FROM team_invitations WHERE email = $1 AND status = 'pending'",
      [email]
    );

    for (const invite of invitations.rows) {
      // Add user to team
      await pool.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [invite.team_id, newUser.id, 'member']
      );
      // Update invitation status
      await pool.query(
        "UPDATE team_invitations SET status = 'accepted' WHERE id = $1",
        [invite.id]
      );
    }

    // Auto-login after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(201).json({ user: newUser });
      }
      res.status(201).json({ user: newUser });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', loginValidation, handleValidationErrors, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Session error:', loginErr);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      res.json({ user });
    });
  })(req, res, next);
});

/**
 * POST /api/auth/logout
 * Destroy session and log out
 */
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('Session destroy error:', sessionErr);
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

/**
 * Configure Passport.js with Local Strategy
 * Uses email + password for authentication
 */
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        // Find user by email
        const result = await pool.query(
          'SELECT id, name, email, password, avatar_url, created_at FROM users WHERE email = $1',
          [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare password with bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Remove password from user object before returning
        const { password: _, ...safeUser } = user;
        return done(null, safeUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user ID into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session by ID
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;

const session = require('express-session');

/**
 * Create session middleware
 * Uses PostgreSQL store in production, MemoryStore in development
 */
function createSessionMiddleware() {
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  };

  // Use PostgreSQL session store in production
  if (process.env.NODE_ENV === 'production') {
    const pgSession = require('connect-pg-simple')(session);
    const { pool } = require('./db');

    sessionConfig.store = new pgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });

    console.log('🔒 Using PostgreSQL session store');
  } else {
    console.log('⚠️  Using in-memory session store (development only)');
  }

  return session(sessionConfig);
}

module.exports = { createSessionMiddleware };

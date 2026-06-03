const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Log connection status
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

/**
 * Initialize database schema from init.sql
 */
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schema);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error.message);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let useSqlite = false;
let sqliteDb = null;

// Create connection pool for PostgreSQL
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pgPool.on('error', (err) => {
  if (useSqlite) return; // Ignore PostgreSQL errors if we fell back to SQLite
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

/**
 * Translate PostgreSQL DDL schema to SQLite DDL schema
 */
function translateSchema(schemaSql) {
  return schemaSql
    .replace(/\bSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/\bTIMESTAMP DEFAULT NOW\(\)/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
    .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/\bTIMESTAMP\(6\)\b/gi, 'TIMESTAMP')
    .replace(/COLLATE "default"/gi, '');
}

/**
 * Translate PostgreSQL query text and parameters to SQLite dialect
 */
function translateSql(sql, params = []) {
  if (!params || !Array.isArray(params)) {
    params = [];
  }
  
  // Replace ILIKE with LIKE (which is case-insensitive in SQLite for ASCII characters)
  let translatedSql = sql.replace(/\bILIKE\b/gi, 'LIKE');
  
  // Replace NOW() + INTERVAL '24 hours' with SQLite datetime function
  translatedSql = translatedSql.replace(/NOW\(\)\s*\+\s*INTERVAL\s+'24\s+hours'/gi, "datetime('now', '+24 hours')");
  
  // Replace NOW() with datetime('now')
  translatedSql = translatedSql.replace(/\bNOW\(\)/gi, "datetime('now')");
  
  // Translate positional parameters: $1, $2 => ?, ? and map parameters to their index
  const newParams = [];
  translatedSql = translatedSql.replace(/\$(\d+)/g, (match, num) => {
    const idx = parseInt(num, 10) - 1;
    newParams.push(params[idx]);
    return '?';
  });
  
  return { sql: translatedSql, params: newParams };
}

// Wrapper pool object matching pg.Pool interface
const poolWrapper = {
  on: (event, handler) => {
    if (!useSqlite) {
      pgPool.on(event, handler);
    }
  },
  query: async (text, params) => {
    if (useSqlite) {
      const { sql, params: newParams } = translateSql(text, params);
      const stmt = sqliteDb.prepare(sql);
      let rows = [];
      if (stmt.reader) {
        rows = stmt.all(...newParams);
      } else {
        const info = stmt.run(...newParams);
        rows = [];
      }
      return { rows, rowCount: rows.length };
    } else {
      return pgPool.query(text, params);
    }
  },
  connect: async () => {
    if (useSqlite) {
      // Mimic connection client for transaction support in routes
      return {
        query: async (text, params) => {
          const { sql, params: newParams } = translateSql(text, params);
          const stmt = sqliteDb.prepare(sql);
          let rows = [];
          if (stmt.reader) {
            rows = stmt.all(...newParams);
          } else {
            stmt.run(...newParams);
            rows = [];
          }
          return { rows, rowCount: rows.length };
        },
        release: () => {
          // No-op for SQLite as it runs on a single persistent connection
        }
      };
    } else {
      return pgPool.connect();
    }
  }
};

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  const schemaPath = path.join(__dirname, '..', 'db', 'init.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    console.log('🔄 Attempting to connect to PostgreSQL database...');
    // Test the PostgreSQL connection first
    const client = await pgPool.connect();
    client.release();
    
    console.log('📦 Connected to PostgreSQL successfully!');
    await pgPool.query(schema);
    console.log('✅ PostgreSQL database schema initialized');
  } catch (error) {
    console.log(`⚠️  PostgreSQL connection failed: ${error.message}`);
    console.log('⚙️  Falling back to local SQLite database for development...');
    
    useSqlite = true;
    const dbDir = path.join(__dirname, '..', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const sqlitePath = path.join(dbDir, 'db.sqlite');
    
    sqliteDb = new Database(sqlitePath);
    sqliteDb.pragma('foreign_keys = ON');
    
    const translatedSchema = translateSchema(schema);
    sqliteDb.exec(translatedSchema);
    
    console.log('📦 Connected to SQLite database at', sqlitePath);
    console.log('✅ SQLite database schema initialized');
  }
}

module.exports = { pool: poolWrapper, initializeDatabase };

require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start the server after initializing the database
 */
async function start() {
  try {
    // Initialize database schema
    await initializeDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

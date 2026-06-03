require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

function getDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  console.log('🌱 Starting database seeding with Pakistani names...');
  try {
    // Clear tables (order is important due to foreign keys)
    await pool.query('DELETE FROM team_invitations');
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM team_members');
    await pool.query('DELETE FROM teams');
    await pool.query('DELETE FROM users');
    
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    
    // Insert Users with Pakistani names
    const users = [
      { name: 'Muhammad Ali', email: 'ali@example.com', password: hashedPassword },
      { name: 'Ayesha Khan', email: 'ayesha@example.com', password: hashedPassword },
      { name: 'Hamza Ahmed', email: 'hamza@example.com', password: hashedPassword },
      { name: 'Zainab Fatima', email: 'zainab@example.com', password: hashedPassword },
      { name: 'Bilal Yousuf', email: 'bilal@example.com', password: hashedPassword }
    ];
    
    const dbUsers = [];
    for (const u of users) {
      const res = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [u.name, u.email, u.password]
      );
      dbUsers.push(res.rows[0]);
    }
    console.log(`✅ Seeded ${dbUsers.length} user profiles`);
    
    const ali = dbUsers.find(u => u.email === 'ali@example.com');
    const ayesha = dbUsers.find(u => u.email === 'ayesha@example.com');
    const hamza = dbUsers.find(u => u.email === 'hamza@example.com');
    const zainab = dbUsers.find(u => u.email === 'zainab@example.com');
    const bilal = dbUsers.find(u => u.email === 'bilal@example.com');
    
    // Insert Teams
    const team1Res = await pool.query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name',
      ['Lahore Tech Hub', 'Core engineering team building the backend APIs and frontend dashboard.', ali.id]
    );
    const lahoreTeam = team1Res.rows[0];
    
    const team2Res = await pool.query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name',
      ['Karachi Creative Agency', 'Branding, Figma mockups, typography, and styling team.', ayesha.id]
    );
    const karachiTeam = team2Res.rows[0];
    console.log('✅ Seeded teams');
    
    // Insert Team Members
    // Lahore Tech Hub members
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')", [lahoreTeam.id, ali.id]);
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'admin')", [lahoreTeam.id, hamza.id]);
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')", [lahoreTeam.id, bilal.id]);
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')", [lahoreTeam.id, ayesha.id]);
    
    // Karachi Creative Agency members
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')", [karachiTeam.id, ayesha.id]);
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'admin')", [karachiTeam.id, zainab.id]);
    await pool.query("INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'member')", [karachiTeam.id, ali.id]);
    console.log('✅ Seeded team memberships');
    
    // Insert Tasks
    // Lahore Tech Hub Tasks
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Setup server configuration', 'Define environment files, cors options, and configure Express session middleware.', 'done', 'high', getDateOffset(2), lahoreTeam.id, hamza.id, ali.id]
    );
    
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Integrate Passport authentication', 'Set up local login strategy with bcrypt password hashing and serializing sessions.', 'in_progress', 'urgent', getDateOffset(1), lahoreTeam.id, bilal.id, ali.id]
    );
    
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Write REST API documentation', 'Provide endpoints details, parameter validations, and JSON schema payload mappings.', 'todo', 'medium', getDateOffset(5), lahoreTeam.id, ali.id, hamza.id]
    );
    
    // Karachi Creative Agency Tasks
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Design landing page mockup', 'Create high-fidelity Figma mockups using modern dark theme styles and neon borders.', 'done', 'high', getDateOffset(-1), karachiTeam.id, zainab.id, ayesha.id] // Overdue task
    );
    
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Create typography style guide', 'Draft primary color palettes using harmonious HSL, font sizes, weight scales, and card designs.', 'in_progress', 'low', getDateOffset(3), karachiTeam.id, ayesha.id, zainab.id]
    );
    
    await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['Export branding logo SVG assets', 'Generate light, dark, and transparent logo assets for header and footer structures.', 'todo', 'medium', getDateOffset(4), karachiTeam.id, ali.id, ayesha.id]
    );
    
    console.log('✅ Seeded tasks');
    console.log('🌱 Seeding database completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

// Wait for database initialization before running seed
const { initializeDatabase } = require('../config/db');
initializeDatabase().then(() => {
  seed();
});

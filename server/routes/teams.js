const express = require('express');
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
const { requireTeamRole } = require('../middleware/roles');
const { teamValidation, addMemberValidation, inviteValidation } = require('../validators/teams');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * GET /api/teams
 * List all teams the current user is a member of
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, tm.role as user_role,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
        (SELECT COUNT(*) FROM tasks WHERE team_id = t.id) as task_count,
        u.name as creator_name
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({ teams: result.rows });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teams
 * Create a new team (creator becomes owner)
 */
router.post('/', teamValidation, handleValidationErrors, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { name, description } = req.body;

    // Create the team
    const teamResult = await client.query(
      'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, req.user.id]
    );

    const team = teamResult.rows[0];

    // Add creator as owner
    await client.query(
      "INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'owner')",
      [team.id, req.user.id]
    );

    await client.query('COMMIT');

    // Fetch complete team data
    const result = await pool.query(
      `SELECT t.*, 'owner' as user_role,
        1 as member_count, 0 as task_count,
        u.name as creator_name
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [team.id]
    );

    res.status(201).json({ team: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/teams/:id
 * Get team details with members
 */
router.get('/:id', async (req, res) => {
  try {
    // Check membership
    const memberCheck = await pool.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // Get team details
    const teamResult = await pool.query(
      `SELECT t.*, u.name as creator_name
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team members
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.role ASC, tm.joined_at ASC`,
      [req.params.id]
    );

    // Get pending invitations
    const invitationsResult = await pool.query(
      `SELECT ti.id, ti.email, ti.status, ti.created_at, u.name as invited_by_name
       FROM team_invitations ti
       LEFT JOIN users u ON ti.invited_by = u.id
       WHERE ti.team_id = $1
       ORDER BY ti.created_at DESC`,
      [req.params.id]
    );

    const team = teamResult.rows[0];
    team.user_role = memberCheck.rows[0].role;
    team.members = membersResult.rows;
    team.invitations = invitationsResult.rows;

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/teams/:id
 * Update team info (owner/admin only)
 */
router.put('/:id', requireTeamRole(['owner', 'admin']), teamValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description } = req.body;

    const result = await pool.query(
      'UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team: result.rows[0] });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/teams/:id
 * Delete a team (owner only)
 */
router.delete('/:id', requireTeamRole(['owner']), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teams/:id/members
 * Add a member to the team by email (owner/admin only)
 */
router.post('/:id/members', requireTeamRole(['owner', 'admin']), addMemberValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    // Find user by email
    const userResult = await pool.query('SELECT id, name, email, avatar_url FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'No user found with that email address' });
    }

    const user = userResult.rows[0];

    // Check if already a member
    const existing = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a member of this team' });
    }

    // Prevent adding someone as owner (only original creator)
    const assignRole = role === 'owner' ? 'member' : role;

    // Add member
    await pool.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, user.id, assignRole]
    );

    res.status(201).json({
      member: {
        ...user,
        role: assignRole,
        joined_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/teams/:id/members/:userId
 * Remove a member from the team (owner/admin only)
 */
router.delete('/:id/members/:userId', requireTeamRole(['owner', 'admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent removing the owner
    const memberCheck = await pool.query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found in this team' });
    }

    if (memberCheck.rows[0].role === 'owner') {
      return res.status(403).json({ error: 'Cannot remove the team owner' });
    }

    // Admins cannot remove other admins
    if (memberCheck.rows[0].role === 'admin' && req.teamRole !== 'owner') {
      return res.status(403).json({ error: 'Only the owner can remove admins' });
    }

    await pool.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [req.params.id, userId]
    );

    // Unassign tasks from removed member within this team
    await pool.query(
      'UPDATE tasks SET assigned_to = NULL WHERE team_id = $1 AND assigned_to = $2',
      [req.params.id, userId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/teams/:id/invite
 * Send an email invitation (stubbed — logs to console)
 */
router.post('/:id/invite', requireTeamRole(['owner', 'admin']), inviteValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user is already a member
    const existingUser = await pool.query(
      `SELECT u.id FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE u.email = $1 AND tm.team_id = $2`,
      [email, req.params.id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a member of this team' });
    }

    // Check for existing pending invitation
    const existingInvite = await pool.query(
      "SELECT id FROM team_invitations WHERE team_id = $1 AND email = $2 AND status = 'pending'",
      [req.params.id, email]
    );

    if (existingInvite.rows.length > 0) {
      return res.status(409).json({ error: 'An invitation is already pending for this email' });
    }

    // Create invitation record
    const result = await pool.query(
      'INSERT INTO team_invitations (team_id, email, invited_by) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, email, req.user.id]
    );

    // Stub: Log the invitation email
    console.log(`📧 [STUB] Invitation email sent to ${email} for team ${req.params.id} by ${req.user.name}`);

    res.status(201).json({
      invitation: result.rows[0],
      message: `Invitation sent to ${email} (email delivery stubbed)`,
    });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

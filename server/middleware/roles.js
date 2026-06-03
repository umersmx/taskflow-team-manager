const { pool } = require('../config/db');

/**
 * Middleware factory to check if user has required role in a team.
 * The team ID is read from req.params.id or req.params.teamId or req.body.team_id.
 *
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['owner', 'admin'])
 */
function requireTeamRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      const teamId = req.params.id || req.params.teamId || req.body.team_id;
      const userId = req.user.id;

      if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required' });
      }

      const result = await pool.query(
        'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
        [teamId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'You are not a member of this team' });
      }

      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        });
      }

      // Attach role to request for downstream use
      req.teamRole = userRole;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if user is a member of the team (any role).
 */
function requireTeamMember(req, res, next) {
  return requireTeamRole(['owner', 'admin', 'member'])(req, res, next);
}

module.exports = { requireTeamRole, requireTeamMember };

const express = require('express');
const { pool } = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');
const { taskValidation, taskUpdateValidation } = require('../validators/tasks');
const { handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * GET /api/tasks
 * List tasks with optional filters
 * Query params: team_id, assigned_to, status, priority, search
 */
router.get('/', async (req, res) => {
  try {
    const { team_id, assigned_to, status, priority, search } = req.query;

    let query = `
      SELECT t.*, 
        u_assigned.name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_creator.name as creator_name,
        tm.name as team_name
      FROM tasks t
      JOIN teams tm ON t.team_id = tm.id
      JOIN team_members tmem ON tm.id = tmem.team_id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      LEFT JOIN users u_creator ON t.created_by = u_creator.id
      WHERE tmem.user_id = $1
    `;

    const params = [req.user.id];
    let paramIndex = 2;

    // Filter by team
    if (team_id) {
      query += ` AND t.team_id = $${paramIndex}`;
      params.push(parseInt(team_id));
      paramIndex++;
    }

    // Filter by assignee
    if (assigned_to) {
      if (assigned_to === 'me') {
        query += ` AND t.assigned_to = $${paramIndex}`;
        params.push(req.user.id);
      } else if (assigned_to === 'unassigned') {
        query += ' AND t.assigned_to IS NULL';
        paramIndex--; // No param added
      } else {
        query += ` AND t.assigned_to = $${paramIndex}`;
        params.push(parseInt(assigned_to));
      }
      paramIndex++;
    }

    // Filter by status
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Filter by priority
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Search by title or description
    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tasks/reminders
 * Get overdue tasks and tasks due within 24 hours
 */
router.get('/reminders', async (req, res) => {
  try {
    // Overdue tasks
    const overdueResult = await pool.query(
      `SELECT t.*, tm.name as team_name, u.name as assigned_to_name
       FROM tasks t
       JOIN teams tm ON t.team_id = tm.id
       JOIN team_members tmem ON tm.id = tmem.team_id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE tmem.user_id = $1
         AND t.due_date < NOW()
         AND t.status != 'done'
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );

    // Tasks due within 24 hours
    const upcomingResult = await pool.query(
      `SELECT t.*, tm.name as team_name, u.name as assigned_to_name
       FROM tasks t
       JOIN teams tm ON t.team_id = tm.id
       JOIN team_members tmem ON tm.id = tmem.team_id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE tmem.user_id = $1
         AND t.due_date >= NOW()
         AND t.due_date <= NOW() + INTERVAL '24 hours'
         AND t.status != 'done'
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );

    res.json({
      overdue: overdueResult.rows,
      upcoming: upcomingResult.rows,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, 
        u_assigned.name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_creator.name as creator_name,
        tm.name as team_name
       FROM tasks t
       JOIN teams tm ON t.team_id = tm.id
       JOIN team_members tmem ON tm.id = tmem.team_id
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_creator ON t.created_by = u_creator.id
       WHERE t.id = $1 AND tmem.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or you do not have access' });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', taskValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, team_id, assigned_to } = req.body;

    // Verify user is member of the team
    const memberCheck = await pool.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [team_id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // If assigning to someone, verify they are a team member
    if (assigned_to) {
      const assigneeCheck = await pool.query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [team_id, assigned_to]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned user is not a member of this team' });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        due_date || null,
        team_id,
        assigned_to || null,
        req.user.id,
      ]
    );

    // Fetch complete task with joined data
    const taskResult = await pool.query(
      `SELECT t.*, 
        u_assigned.name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_creator.name as creator_name,
        tm.name as team_name
       FROM tasks t
       JOIN teams tm ON t.team_id = tm.id
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_creator ON t.created_by = u_creator.id
       WHERE t.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({ task: taskResult.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', taskUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    // Verify access to this task
    const existingTask = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or you do not have access' });
    }

    const task = existingTask.rows[0];
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    // If reassigning, verify the new assignee is a team member
    if (assigned_to !== undefined && assigned_to !== null) {
      const assigneeCheck = await pool.query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [task.team_id, assigned_to]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Assigned user is not a member of this team' });
      }
    }

    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = $5,
        assigned_to = $6,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title || null,
        description !== undefined ? description : null,
        status || null,
        priority || null,
        due_date !== undefined ? due_date : task.due_date,
        assigned_to !== undefined ? assigned_to : task.assigned_to,
        req.params.id,
      ]
    );

    // Fetch complete updated task
    const taskResult = await pool.query(
      `SELECT t.*, 
        u_assigned.name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_creator.name as creator_name,
        tm.name as team_name
       FROM tasks t
       JOIN teams tm ON t.team_id = tm.id
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_creator ON t.created_by = u_creator.id
       WHERE t.id = $1`,
      [req.params.id]
    );

    res.json({ task: taskResult.rows[0] });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task (creator or team owner/admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    // Verify access and check permissions
    const taskResult = await pool.query(
      `SELECT t.*, tm.role as user_team_role
       FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or you do not have access' });
    }

    const task = taskResult.rows[0];

    // Only task creator, team owner, or team admin can delete
    const canDelete =
      task.created_by === req.user.id ||
      task.user_team_role === 'owner' ||
      task.user_team_role === 'admin';

    if (!canDelete) {
      return res.status(403).json({ error: 'Only the task creator or team owner/admin can delete tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

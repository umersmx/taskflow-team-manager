const { body } = require('express-validator');

/**
 * Validation rules for creating/updating a task
 */
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2000 characters or less'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be todo, in_progress, review, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  body('due_date')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('team_id')
    .notEmpty()
    .withMessage('Team ID is required')
    .isInt({ min: 1 })
    .withMessage('Team ID must be a positive integer'),

  body('assigned_to')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Assigned user ID must be a positive integer'),
];

/**
 * Validation rules for updating a task (all fields optional)
 */
const taskUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be 2000 characters or less'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be todo, in_progress, review, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  body('due_date')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('assigned_to')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('Assigned user ID must be a positive integer'),
];

module.exports = { taskValidation, taskUpdateValidation };

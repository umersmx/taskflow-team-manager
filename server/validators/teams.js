const { body } = require('express-validator');

/**
 * Validation rules for creating/updating a team
 */
const teamValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Team name must be between 2 and 100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or less')
    .escape(),
];

/**
 * Validation rules for adding a member to a team
 */
const addMemberValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Member email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be either admin or member'),
];

/**
 * Validation rules for inviting a member via email
 */
const inviteValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

module.exports = { teamValidation, addMemberValidation, inviteValidation };

const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator.
 * Returns a 400 response with formatted error messages.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors,
    });
  }

  next();
}

module.exports = { handleValidationErrors };

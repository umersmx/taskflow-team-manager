/**
 * Authentication middleware
 * Protects routes that require a logged-in user
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required. Please log in.' });
}

module.exports = { isAuthenticated };

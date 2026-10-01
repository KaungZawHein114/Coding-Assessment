// Checks who is logged in and blocks pages from people who are not allowed.
const userModel = require('../models/userModel');

// Loads the current user (fresh from the DB) onto req.user / res.locals.currentUser.
// Runs on every request: finds the logged-in user (if any) so pages and routes can use it.
function loadUser(req, res, next) {
  req.user = null;
  if (req.session.userId) {
    const u = userModel.findById(req.session.userId);
    if (u) req.user = { id: u.id, email: u.email, role: u.role };
    else delete req.session.userId;
  }
  res.locals.currentUser = req.user;
  next();
}

// Must be logged in, otherwise go to the login page.
function requireAuth(req, res, next) {
  if (req.user) return next();
  req.flash('error', 'Please log in to continue.');
  res.redirect('/login');
}

// Must be logged in AND be an admin, otherwise show 403 Forbidden.
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      const err = new Error('You do not have permission to access this page.');
      err.status = 403;
      return next(err);
    }
    next();
  });
}

module.exports = { loadUser, requireAuth, requireAdmin };

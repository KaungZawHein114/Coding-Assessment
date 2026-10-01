// Controllers are thin: read the request, call a service, show a page or redirect.
// This one handles login and logout.
const authService = require('../services/authService');

function showLogin(req, res) {
  if (req.user) return res.redirect('/admin');
  res.render('auth/login', { title: 'Log in' });
}

function login(req, res, next) {
  // Check the email and password.
  const user = authService.authenticate(req.body.email, req.body.password);
  if (!user) {
    // Generic message: do not reveal whether the email exists.
    res.locals.flash.push({ type: 'error', message: 'Invalid email or password' });
    return res.status(401).render('auth/login', {
      title: 'Log in',
      values: { email: typeof req.body.email === 'string' ? req.body.email.slice(0, 254) : '' },
    });
  }
  // Regenerate the session ID on login to prevent session fixation.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.userId = user.id;
    req.flash('success', 'Welcome back!');
    res.redirect('/admin');
  });
}

function logout(req, res, next) {
  // Regenerate = destroy the old session server-side and start a fresh anonymous one.
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out.');
    res.redirect('/login');
  });
}

module.exports = { showLogin, login, logout };

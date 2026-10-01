// Protects forms: every POST must include the secret token that we put in the form.
// This stops other websites from submitting forms on behalf of a logged-in admin.
const crypto = require('node:crypto');

// Per-session token; required (as the `_csrf` body field) on every POST.
// (the token is saved in the session and added to every form as a hidden field)
function csrf(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;

  if (req.method === 'POST') {
    // The token sent by the form must match the one saved in the session.
    const ok = req.body && req.body._csrf === req.session.csrfToken;
    if (!ok) {
      const err = new Error('Invalid or missing security token. Please go back, refresh the page and try again.');
      err.status = 403;
      return next(err);
    }
  }
  next();
}

module.exports = csrf;

// "Flash" messages: a message saved in the session that is shown once on the next page.
// Session-based flash messages: req.flash(type, message); consumed into res.locals.flash.
function flash(req, res, next) {
  req.flash = (type, message) => {
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type, message });
  };
  res.locals.flash = req.session.flash || [];
  delete req.session.flash;
  next();
}

module.exports = flash;

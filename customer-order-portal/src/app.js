// Builds the Express app: security settings, sessions, routes and error pages.
const path = require('node:path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);

const config = require('./config');
const db = require('./db/connection');
const authService = require('./services/authService');
const flash = require('./middleware/flash');
const csrf = require('./middleware/csrf');
const { loadUser } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { formatMoney, centsToInput } = require('./utils/money');
const orderStatus = require('./utils/orderStatus');
const routes = require('./routes');

authService.ensureAdmin();

const app = express();
// Do not tell visitors we use Express.
app.disable('x-powered-by');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// helmet adds security headers (for example a rule that only allows scripts and styles from this site).
// upgradeInsecureRequests is turned off because we run on plain http://localhost.
app.use(helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } } }));

// Serve CSS and JS files from the public folder.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// Sessions remember who is logged in. They are stored in the SQLite database.
app.use(
  session({
    name: 'sid',
    // The secret signs the session cookie so it cannot be faked.
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SqliteStore({ client: db }),
    cookie: {
      // httpOnly: browser JavaScript cannot read the cookie.
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

// Order matters: flash, current user and page helpers must be ready before the CSRF check,
// because a failed check still shows an error page that needs them.
app.use(flash);
app.use(loadUser);

// Values and helper functions that every page (view) can use.
app.use((req, res, next) => {
  res.locals.formatMoney = formatMoney;
  res.locals.centsToInput = centsToInput;
  res.locals.formatDate = (s) => (s ? String(s).slice(0, 16) : '');
  res.locals.orderStatus = orderStatus;
  res.locals.currentPath = req.path;
  res.locals.errors = {};
  res.locals.values = {};
  next();
});

app.use(csrf);

app.use(routes);
// If no route matched, show 404. Any error ends up in errorHandler.
app.use(notFound);
app.use(errorHandler);

module.exports = app;

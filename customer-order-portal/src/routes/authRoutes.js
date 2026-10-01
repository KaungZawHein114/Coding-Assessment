// URLs for /login and /logout.
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const auth = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Limit login attempts to slow down password guessing.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const err = new Error('Too many attempts from your address. Please wait 15 minutes and try again.');
    err.status = 429;
    next(err);
  },
});

router.get('/login', auth.showLogin);
router.post('/login', limiter, auth.login);
router.post('/logout', requireAuth, auth.logout);

module.exports = router;

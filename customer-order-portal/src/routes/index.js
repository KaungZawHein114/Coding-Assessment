// Connects URLs to the right route files.
const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  if (!req.user) return res.redirect('/login');
  res.redirect('/admin');
});

router.use(authRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

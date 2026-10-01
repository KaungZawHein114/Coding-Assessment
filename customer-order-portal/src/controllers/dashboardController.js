// Shows the admin dashboard.
const orderService = require('../services/orderService');

function admin(req, res) {
  res.render('admin/dashboard', { title: 'Dashboard', stats: orderService.dashboardStats() });
}

module.exports = { admin };

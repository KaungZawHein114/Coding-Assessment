// All /admin/... URLs. Only a logged-in admin can open them.
const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const dashboard = require('../controllers/dashboardController');
const customers = require('../controllers/customerController');
const orders = require('../controllers/orderController');

const router = express.Router();
// Everything below needs an admin.
router.use(requireAdmin);

router.get('/', dashboard.admin);

router.get('/customers', customers.index);
// "new" must come before "/:id", otherwise "new" would be read as an id.
router.get('/customers/new', customers.newForm);
router.post('/customers', customers.create);
router.get('/customers/:id', customers.show);
router.get('/customers/:id/edit', customers.editForm);
router.post('/customers/:id', customers.update);
router.post('/customers/:id/delete', customers.destroy);

router.get('/orders', orders.index);
router.get('/orders/new', orders.newForm);
router.post('/orders', orders.create);
router.get('/orders/:id', orders.show);
router.get('/orders/:id/edit', orders.editForm);
router.post('/orders/:id', orders.update);
router.post('/orders/:id/status', orders.changeStatus);

module.exports = router;

// Handles the customer pages (list, create, view, edit, delete).
const customerService = require('../services/customerService');
const orderService = require('../services/orderService');
const v = require('../middleware/validate');
const { ValidationError, BusinessError } = require('../utils/errors');

function index(req, res) {
  const { customers, pager, q } = customerService.list({ q: req.query.q, page: req.query.page });
  res.render('admin/customers/index', { title: 'Customers', customers, pager, q });
}

function newForm(req, res) {
  res.render('admin/customers/new', { title: 'New Customer' });
}

function create(req, res, next) {
  try {
    const { id } = customerService.create(req.body);
    req.flash('success', 'Customer created.');
    res.redirect(`/admin/customers/${id}`);
  } catch (err) {
    if (!(err instanceof ValidationError)) return next(err);
    res.status(422).render('admin/customers/new', { title: 'New Customer', errors: err.errors, values: err.values });
  }
}

function show(req, res) {
  const customer = customerService.getById(v.id(req.params.id));
  const { orders, pager } = orderService.list({ customerId: customer.id, page: req.query.page });
  res.render('admin/customers/show', { title: customer.name, customer, orders, pager });
}

function editForm(req, res) {
  const customer = customerService.getById(v.id(req.params.id));
  res.render('admin/customers/edit', { title: `Edit ${customer.name}`, customer, values: customer });
}

function update(req, res, next) {
  const id = v.id(req.params.id);
  try {
    customerService.update(id, req.body);
    req.flash('success', 'Customer updated.');
    res.redirect(`/admin/customers/${id}`);
  } catch (err) {
    if (!(err instanceof ValidationError)) return next(err);
    const customer = customerService.getById(id);
    res.status(422).render('admin/customers/edit', {
      title: `Edit ${customer.name}`,
      customer,
      errors: err.errors,
      values: err.values,
    });
  }
}

function destroy(req, res, next) {
  try {
    const customer = customerService.remove(v.id(req.params.id));
    req.flash('success', `Customer "${customer.name}" was deleted.`);
  } catch (err) {
    if (!(err instanceof BusinessError)) return next(err);
    req.flash('error', err.message);
  }
  res.redirect('/admin/customers');
}

module.exports = { index, newForm, create, show, editForm, update, destroy };

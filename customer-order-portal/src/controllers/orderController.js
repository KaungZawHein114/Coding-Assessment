// Handles the order pages (list, create, view, edit, change status).
const orderService = require('../services/orderService');
const customerService = require('../services/customerService');
const v = require('../middleware/validate');
const { isFinal } = require('../utils/orderStatus');
const { ValidationError, BusinessError } = require('../utils/errors');

const BASE = '/admin/orders';

function index(req, res) {
  const result = orderService.list(req.query);
  const customers = customerService.listAll();
  const filterCustomer = result.customerId ? customers.find((c) => c.id === result.customerId) : null;
  res.render('admin/orders/index', { title: 'Orders', base: BASE, ...result, customers, filterCustomer });
}

function newForm(req, res) {
  res.render('admin/orders/new', {
    title: 'New Order',
    customers: customerService.listAll(),
    values: { customer_id: String(v.id(req.query.customer_id) || ''), quantity: '1' },
  });
}

function create(req, res, next) {
  try {
    const order = orderService.create(req.body);
    req.flash('success', `Order ${order.order_number} created.`);
    res.redirect(`${BASE}/${order.id}`);
  } catch (err) {
    if (!(err instanceof ValidationError)) return next(err);
    res.status(422).render('admin/orders/new', {
      title: 'New Order',
      customers: customerService.listAll(),
      errors: err.errors,
      values: err.values,
    });
  }
}

function show(req, res) {
  const order = orderService.getById(v.id(req.params.id));
  res.render('admin/orders/show', { title: order.order_number, order });
}

function editForm(req, res) {
  const order = orderService.getById(v.id(req.params.id));
  if (isFinal(order.status)) {
    req.flash('error', `${order.status} orders cannot be edited.`);
    return res.redirect(`${BASE}/${order.id}`);
  }
  res.render('admin/orders/edit', {
    title: `Edit ${order.order_number}`,
    order,
    values: {
      item_name: order.item_name,
      quantity: String(order.quantity),
      unit_price: res.locals.centsToInput(order.unit_price_cents),
      notes: order.notes,
    },
  });
}

function update(req, res, next) {
  const id = v.id(req.params.id);
  try {
    const order = orderService.updateDetails(id, req.body);
    req.flash('success', `Order ${order.order_number} updated.`);
    res.redirect(`${BASE}/${id}`);
  } catch (err) {
    if (err instanceof BusinessError) {
      req.flash('error', err.message);
      return res.redirect(`${BASE}/${id}`);
    }
    if (!(err instanceof ValidationError)) return next(err);
    const order = orderService.getById(id);
    res.status(422).render('admin/orders/edit', {
      title: `Edit ${order.order_number}`,
      order,
      errors: err.errors,
      values: err.values,
    });
  }
}

function changeStatus(req, res, next) {
  const id = v.id(req.params.id);
  try {
    const order = orderService.changeStatus(id, v.str(req.body.status));
    req.flash('success', `Order ${order.order_number} is now ${order.status}.`);
  } catch (err) {
    if (!(err instanceof BusinessError)) return next(err);
    req.flash('error', err.message);
  }
  res.redirect(`${BASE}/${id}`);
}

module.exports = { index, newForm, create, show, editForm, update, changeStatus };

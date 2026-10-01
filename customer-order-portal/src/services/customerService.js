// Rules for customers: validation, unique email, and "cannot delete if it has orders".
const config = require('../config');
const db = require('../db/connection');
const customerModel = require('../models/customerModel');
const orderModel = require('../models/orderModel');
const v = require('../middleware/validate');
const { paginate } = require('../utils/pagination');
const { ValidationError, BusinessError, NotFoundError } = require('../utils/errors');

function validateFields(input) {
  return v.collect({
    name: v.text(input.name, 'Name', { max: 100 }),
    email: v.email(input.email),
    phone: v.text(input.phone, 'Phone', { max: 30, required: false }),
    address: v.text(input.address, 'Address', { max: 255, required: false }),
  });
}

function list({ q = '', page = 1 } = {}) {
  const search = v.str(q).slice(0, 100);
  const total = customerModel.count({ q: search });
  const pager = paginate({ page, total, pageSize: config.pageSize });
  const customers = customerModel.list({ q: search, limit: pager.pageSize, offset: pager.offset });
  return { customers, pager, q: search };
}

function getById(id) {
  const customer = id ? customerModel.findById(id) : undefined;
  if (!customer) throw new NotFoundError('Customer not found.');
  return customer;
}

// True if another customer already uses this email.
function emailTaken(email, customerId) {
  const c = customerModel.findByEmail(email);
  return Boolean(c && c.id !== customerId);
}

function create(input) {
  const { values, errors } = validateFields(input);
  if (!errors.email && emailTaken(values.email, null)) errors.email = 'This email is already in use.';
  if (Object.keys(errors).length) throw new ValidationError(errors, values);
  return { id: customerModel.create(values) };
}

function update(id, input) {
  const existing = getById(id);
  const { values, errors } = validateFields(input);
  if (!errors.email && emailTaken(values.email, existing.id)) errors.email = 'This email is already in use.';
  if (Object.keys(errors).length) throw new ValidationError(errors, values);
  customerModel.update({ id, ...values });
}

/** Blocked when the customer has any order (any status). The FK RESTRICT is the DB-level backstop. */
const remove = db.transaction((id) => {
  const customer = getById(id);
  // Rule: a customer with any order cannot be deleted.
  const orderCount = orderModel.countForCustomer(id);
  if (orderCount > 0) {
    throw new BusinessError(
      `This customer has ${orderCount} order${orderCount === 1 ? '' : 's'} and cannot be deleted.`
    );
  }
  customerModel.delete(id);
  return customer;
});

module.exports = { list, getById, create, update, remove, listAll: customerModel.listAll };

// Rules for orders: validation, total price, order numbers and status changes.
const config = require('../config');
const db = require('../db/connection');
const orderModel = require('../models/orderModel');
const customerModel = require('../models/customerModel');
const v = require('../middleware/validate');
const { paginate } = require('../utils/pagination');
const { parsePriceToCents } = require('../utils/money');
const status = require('../utils/orderStatus');
const { ValidationError, BusinessError, NotFoundError } = require('../utils/errors');

function validateDetails(input) {
  const fields = {
    item_name: v.text(input.item_name, 'Item name', { max: 150 }),
    quantity: v.positiveInt(input.quantity, 'Quantity', { max: 10000 }),
    notes: v.text(input.notes, 'Notes', { max: 1000, required: false }),
  };
  // Convert the typed price (like 19.99) to cents.
  const priceCents = parsePriceToCents(input.unit_price);
  const price = { value: v.str(input.unit_price) };
  if (priceCents === null) price.error = 'Unit price must be a non-negative amount like 19.99.';
  fields.unit_price = price;
  const result = v.collect(fields);
  result.priceCents = priceCents;
  return result;
}

/** Order number: ORD-YYYYMMDD-NNNN, sequence per day. Call inside a transaction. */
function nextOrderNumber(date = new Date()) {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${day}-`;
  // Find today's highest number, then add 1.
  const last = orderModel.lastNumberWithPrefix(prefix);
  const seq = last ? parseInt(last.slice(prefix.length), 10) + 1 : 1;
  return prefix + String(seq).padStart(4, '0');
}

function list({ status: statusFilter, page, customerId } = {}) {
  const filter = {
    status: status.isValidStatus(statusFilter) ? statusFilter : null,
    customerId: v.id(customerId),
  };
  const total = orderModel.count(filter);
  const pager = paginate({ page, total, pageSize: config.pageSize });
  const orders = orderModel.list({ ...filter, limit: pager.pageSize, offset: pager.offset });
  const counts = Object.fromEntries(status.STATUSES.map((s) => [s, 0]));
  let all = 0;
  for (const row of orderModel.statusCounts(filter.customerId)) {
    counts[row.status] = row.n;
    all += row.n;
  }
  counts.All = all;
  return { orders, pager, counts, status: filter.status, customerId: filter.customerId };
}

function getById(id) {
  const order = id ? orderModel.findById(id) : undefined;
  if (!order) throw new NotFoundError('Order not found.');
  return order;
}

/** Total is always computed here from quantity x unit price; any posted total is ignored. */
const create = db.transaction((input) => {
  const customerId = v.id(input.customer_id);
  const { values, errors, priceCents } = validateDetails(input);
  // The customer must exist.
  const customer = customerId ? customerModel.findById(customerId) : undefined;
  if (!customer) errors.customer_id = 'Select a valid customer.';
  values.customer_id = customerId ? String(customerId) : '';
  if (Object.keys(errors).length) throw new ValidationError(errors, { ...values, unit_price: v.str(input.unit_price) });

  const id = orderModel.create({
    order_number: nextOrderNumber(),
    customer_id: customer.id,
    item_name: values.item_name,
    quantity: values.quantity,
    unit_price_cents: priceCents,
    // Total is calculated here, never taken from the form.
    total_cents: values.quantity * priceCents,
    notes: values.notes,
  });
  return orderModel.findById(id);
});

/** Completed/cancelled orders are locked. */
const updateDetails = db.transaction((id, input) => {
  const order = getById(id);
  if (status.isFinal(order.status)) {
    throw new BusinessError(`${order.status} orders cannot be edited.`);
  }
  const { values, errors, priceCents } = validateDetails(input);
  if (Object.keys(errors).length) throw new ValidationError(errors, values);
  orderModel.updateDetails({
    id,
    item_name: values.item_name,
    quantity: values.quantity,
    unit_price_cents: priceCents,
    total_cents: values.quantity * priceCents,
    notes: values.notes,
  });
  return orderModel.findById(id);
});

/** Validates the transition against the table in utils/orderStatus. */
const changeStatus = db.transaction((id, nextStatus) => {
  const order = getById(id);
  if (!status.isValidStatus(nextStatus)) throw new BusinessError('Invalid status.');
  // Only allow the moves listed in utils/orderStatus.js.
  if (!status.canTransition(order.status, nextStatus)) {
    throw new BusinessError(`Invalid status change: ${order.status} cannot move to ${nextStatus}.`);
  }
  orderModel.updateStatus(id, nextStatus);
  return orderModel.findById(id);
});

function dashboardStats() {
  const counts = Object.fromEntries(status.STATUSES.map((s) => [s, 0]));
  let totalOrders = 0;
  for (const row of orderModel.statusCounts(null)) {
    counts[row.status] = row.n;
    totalOrders += row.n;
  }
  return { counts, totalOrders, totalCustomers: customerModel.total(), recent: orderModel.recent(5) };
}

module.exports = {
  list,
  getById,
  create,
  updateDetails,
  changeStatus,
  dashboardStats,
  nextOrderNumber,
};

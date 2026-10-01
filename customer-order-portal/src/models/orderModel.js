// Database access for the orders table.
const db = require('../db/connection');

const BASE = `SELECT o.*, c.name AS customer_name, c.email AS customer_email
              FROM orders o JOIN customers c ON c.id = o.customer_id`;
// NULL parameters mean "no filter". Values are always passed as parameters (? or @name),
// never pasted into the SQL text, which prevents SQL injection.
const WHERE = `WHERE (@customerId IS NULL OR o.customer_id = @customerId)
               AND (@status IS NULL OR o.status = @status)`;

const stmts = {
  byId: db.prepare(`${BASE} WHERE o.id = ?`),
  insert: db.prepare(
    `INSERT INTO orders (order_number, customer_id, item_name, quantity, unit_price_cents, total_cents, notes)
     VALUES (@order_number, @customer_id, @item_name, @quantity, @unit_price_cents, @total_cents, @notes)`
  ),
  updateDetails: db.prepare(
    `UPDATE orders SET item_name = @item_name, quantity = @quantity, unit_price_cents = @unit_price_cents,
     total_cents = @total_cents, notes = @notes, updated_at = datetime('now') WHERE id = @id`
  ),
  updateStatus: db.prepare(
    `UPDATE orders SET status = @status, updated_at = datetime('now') WHERE id = @id`
  ),
  list: db.prepare(`${BASE} ${WHERE} ORDER BY o.created_at DESC, o.id DESC LIMIT @limit OFFSET @offset`),
  count: db.prepare(`SELECT COUNT(*) AS n FROM orders o ${WHERE}`),
  statusCounts: db.prepare(
    `SELECT status, COUNT(*) AS n FROM orders
     WHERE (@customerId IS NULL OR customer_id = @customerId) GROUP BY status`
  ),
  countForCustomer: db.prepare('SELECT COUNT(*) AS n FROM orders WHERE customer_id = ?'),
  lastNumber: db.prepare(
    'SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1'
  ),
  recent: db.prepare(`${BASE} ORDER BY o.created_at DESC, o.id DESC LIMIT ?`),
};

const filters = (f) => ({ customerId: f.customerId ?? null, status: f.status ?? null });

module.exports = {
  findById: (id) => stmts.byId.get(id),
  create: (o) => Number(stmts.insert.run({ notes: '', ...o }).lastInsertRowid),
  updateDetails: (o) => stmts.updateDetails.run(o),
  updateStatus: (id, status) => stmts.updateStatus.run({ id, status }),
  list: (f) => stmts.list.all({ ...filters(f), limit: f.limit, offset: f.offset }),
  count: (f) => stmts.count.get(filters(f)).n,
  statusCounts: (customerId = null) => stmts.statusCounts.all({ customerId }),
  countForCustomer: (id) => stmts.countForCustomer.get(id).n,
  lastNumberWithPrefix: (prefix) => stmts.lastNumber.get(prefix + '%')?.order_number,
  recent: (n) => stmts.recent.all(n),
};

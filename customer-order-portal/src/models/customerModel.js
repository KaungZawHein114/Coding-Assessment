// Models only talk to the database (SQL). The rules live in the services folder.
const db = require('../db/connection');

// Search by name or email. An empty search matches everyone.
const SEARCH = `(@q = '' OR c.name LIKE @like ESCAPE '\\' OR c.email LIKE @like ESCAPE '\\')`;

const stmts = {
  byId: db.prepare('SELECT * FROM customers WHERE id = ?'),
  byEmail: db.prepare('SELECT * FROM customers WHERE email = ?'),
  insert: db.prepare(
    'INSERT INTO customers (name, email, phone, address) VALUES (@name, @email, @phone, @address)'
  ),
  update: db.prepare(
    `UPDATE customers SET name = @name, email = @email, phone = @phone, address = @address,
     updated_at = datetime('now') WHERE id = @id`
  ),
  remove: db.prepare('DELETE FROM customers WHERE id = ?'),
  all: db.prepare('SELECT id, name, email FROM customers ORDER BY name COLLATE NOCASE'),
  list: db.prepare(
    `SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count
     FROM customers c WHERE ${SEARCH}
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT @limit OFFSET @offset`
  ),
  count: db.prepare(`SELECT COUNT(*) AS n FROM customers c WHERE ${SEARCH}`),
  total: db.prepare('SELECT COUNT(*) AS n FROM customers'),
};

// Turns "ann" into "%ann%" (match anywhere) and escapes special characters.
const likePattern = (q) => '%' + q.replace(/[\\%_]/g, (m) => '\\' + m) + '%';

module.exports = {
  findById: (id) => stmts.byId.get(id),
  findByEmail: (email) => stmts.byEmail.get(email),
  create: (c) => Number(stmts.insert.run(c).lastInsertRowid),
  update: (c) => stmts.update.run(c),
  delete: (id) => stmts.remove.run(id),
  listAll: () => stmts.all.all(),
  list: ({ q, limit, offset }) => stmts.list.all({ q, like: likePattern(q), limit, offset }),
  count: ({ q }) => stmts.count.get({ q, like: likePattern(q) }).n,
  total: () => stmts.total.get().n,
};

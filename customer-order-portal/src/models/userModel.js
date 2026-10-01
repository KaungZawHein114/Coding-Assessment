// Database access for the users table (admin logins).
const db = require('../db/connection');

const stmts = {
  byId: db.prepare('SELECT * FROM users WHERE id = ?'),
  byEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  insert: db.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (@email, @password_hash, @role)'
  ),
  adminCount: db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'"),
};

module.exports = {
  findById: (id) => stmts.byId.get(id),
  findByEmail: (email) => stmts.byEmail.get(email),
  create: (u) => Number(stmts.insert.run({ role: 'admin', ...u }).lastInsertRowid),
  adminCount: () => stmts.adminCount.get().n,
};

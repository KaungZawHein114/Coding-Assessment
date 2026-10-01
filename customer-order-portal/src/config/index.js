// All settings in one place. Change a value here if you want something different.
const path = require('node:path');

module.exports = {
  port: 3000,
  // Used to sign the login cookie so it cannot be faked.
  sessionSecret: 'coding-assessment-secret',
  // Where the SQLite database file is saved.
  dbPath: path.resolve('./data/app.db'),
  // Rows per page in lists.
  pageSize: 10,
  // How slow password hashing is on purpose (higher = safer but slower).
  bcryptRounds: 10,
  // Max login attempts per 15 minutes from one address.
  rateLimitMax: 10,
  // Created automatically on first start if there is no admin yet.
  defaultAdmin: {
    email: 'admin@example.com',
    password: 'Admin@12345',
  },
};

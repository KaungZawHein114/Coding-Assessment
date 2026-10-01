// Login logic: checks the password and creates the first admin.
const bcrypt = require('bcryptjs');
const config = require('../config');
const userModel = require('../models/userModel');
const v = require('../middleware/validate');

const hashPassword = (plain) => bcrypt.hashSync(plain, config.bcryptRounds);

/** Returns the user row on success, otherwise null (callers show a generic message). */
function authenticate(emailRaw, password) {
  const email = v.str(emailRaw).toLowerCase();
  const user = email ? userModel.findByEmail(email) : undefined;
  if (!user) return null;
  // bcrypt compares the typed password with the stored hash (we never store the real password).
  const ok = bcrypt.compareSync(typeof password === 'string' ? password : '', user.password_hash);
  return ok ? user : null;
}

/** Creates the default admin on first start when none exists. */
function ensureAdmin() {
  if (userModel.adminCount() > 0) return false;
  userModel.create({
    email: config.defaultAdmin.email.toLowerCase(),
    password_hash: hashPassword(config.defaultAdmin.password),
  });
  console.log(`[setup] No admin found - created default admin ${config.defaultAdmin.email}. Change the password for real use.`);
  return true;
}

module.exports = { authenticate, ensureAdmin, hashPassword };

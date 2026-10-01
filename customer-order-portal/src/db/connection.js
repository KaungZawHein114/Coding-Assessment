// Opens the SQLite database file and creates the tables if they do not exist yet.
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const config = require('../config');

if (config.dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

const db = new Database(config.dbPath);
// WAL = faster, safer writes. foreign_keys = enforce links between tables.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Idempotent "migration on start" (CREATE TABLE IF NOT EXISTS). The session
// store creates its own `sessions` table.
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

module.exports = db;

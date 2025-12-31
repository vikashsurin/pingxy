import db from "./client";

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    roles TEXT DEFAULT '["guest"]',
    username TEXT UNIQUE NOT NULL,
    data JSON NOT NULL,
    passhash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Roles table
db.run(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_name TEXT NOT NULL UNIQUE
  );
`);

// Seed default roles
const rolesToSeed = ["admin", "moderator", "user", "guest"];
rolesToSeed.forEach((role) => {
  db.run("INSERT OR IGNORE INTO roles (role_name) VALUES (?)", [role]);
});

// Banned Users table
db.run(`
  CREATE TABLE IF NOT EXISTS banned_users (
    uid TEXT PRIMARY KEY,
    reason TEXT NOT NULL,
    banned_by TEXT NOT NULL,
    expires_at INTEGER, -- Nullable for permanent bans
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (banned_by) REFERENCES users(uid)
  );
`);

// User Roles table (many-to-many relationship between users and roles)
db.run(`
  CREATE TABLE IF NOT EXISTS user_roles (
    uid TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (uid, role_id),
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
  );
`);

// Messages table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(uid),
    FOREIGN KEY(recipient_id) REFERENCES users(uid)
  )
`);

// Session table
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    last_activity INTEGER NOT NULL, -- Sliding timeout (30 mins)
    expires_at INTEGER NOT NULL,    -- Absolute timeout (e.g., 24 hours)
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    
    -- Security Metadata
    ip_address TEXT,                -- Detect location/network changes
    user_agent TEXT,                -- Detect device/browser changes
    
    FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE CASCADE
  );
`);

try {
  // Create an index for faster 'online users' lookups
  db.run(
    `CREATE INDEX idx_sessions_active ON sessions(expires_at, last_activity, uid);
    `
  );
} catch (error) { }

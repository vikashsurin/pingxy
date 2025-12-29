import db from "./client";

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Create tables if not exist
// Users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    data JSON NOT NULL,
    passhash TEXT,
    is_guest BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Messages table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT, -- NULL for global/room chat (legacy), or specific user for DM
    room_id TEXT,      -- NULL for DM, Set for Room
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(uid),
    FOREIGN KEY(recipient_id) REFERENCES users(uid),
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  )
`);

// Rooms table
db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    type TEXT DEFAULT 'public',
    max_users INTEGER DEFAULT 0
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

// Migrations
try {
  db.run("ALTER TABLE messages ADD COLUMN room_id TEXT REFERENCES rooms(id)");
  // Migrate existing global messages
  db.run(
    "UPDATE messages SET room_id = 'global' WHERE recipient_id IS NULL AND room_id IS NULL"
  );
} catch (e) {
  // Column likely exists, ignore
}

try {
  db.run("ALTER TABLE rooms ADD COLUMN max_users INTEGER DEFAULT 0");
} catch (e) {
  // Column likely exists
}

try {
  // Create an index for faster 'online users' lookups
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_sessions_activity ON sessions(last_activity)`
  );
} catch (error) {}

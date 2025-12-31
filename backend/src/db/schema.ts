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
// Note: includes a dedicated `read` flag; keep in sync with queries/messages.ts
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_id TEXT,
    content TEXT NOT NULL,
    room_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent',
    read INTEGER DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(uid),
    FOREIGN KEY(recipient_id) REFERENCES users(uid),
    FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )
`);

// Backfill for existing databases that might be missing the `read` column
try {
  db.run(`ALTER TABLE messages ADD COLUMN read INTEGER DEFAULT 0;`);
} catch (error) {}

// Session table
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    last_activity INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at ,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (uid) REFERENCES users (uid) ON DELETE CASCADE
  );
`);

// Rooms table
db.run(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_private INTEGER DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at INTEGER DEFAULT (UNIXEPOCH()),
    updated_at INTEGER DEFAULT (UNIXEPOCH()),
    FOREIGN KEY (created_by) REFERENCES users(uid)
  )
`);

// Room Members table
db.run(`
  CREATE TABLE IF NOT EXISTS room_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    uid TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at INTEGER DEFAULT (UNIXEPOCH()),
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
    UNIQUE(room_id, uid)  -- Prevents duplicate memberships
  )
`);

// user rooms table to track last message and unread counts
db.run(`
  CREATE TABLE IF NOT EXISTS user_rooms (
    user_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    last_message_at DATETIME,
    unread_count INTEGER DEFAULT 0,
    UNIQUE(user_id, room_id),
    FOREIGN KEY(user_id) REFERENCES users(uid),
    FOREIGN KEY(room_id) REFERENCES rooms(id)
  )
`);

// Fast online users lookup
try {
  db.run(
    `CREATE INDEX idx_sessions_active ON sessions(expires_at, last_activity DESC, uid);
    `
  );
} catch (error) {}
try {
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(uid);
    `
  );
} catch (error) {}

try {
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id, is_active);
    `
  );
} catch (error) {}

try {
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_messages_room_time ON messages(room_id, timestamp DESC);`
  );
} catch (error) {}

//  user_rooms performance (sidebar sorting)
try {
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_user_rooms_last_msg ON user_rooms(user_id, last_message_at DESC);`);
} catch (error) {}

// Add missing index for user_rooms
try {
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_user_rooms_user ON user_rooms(user_id)`
  );
} catch (error) {}

// Index for banned users lookup
try {
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_banned_users_active ON banned_users(expires_at, uid);`);
} catch (error) {}

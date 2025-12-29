import { Database } from "bun:sqlite";
import type { User, Message, Room } from "../../shared/src/lib/utils/validation";

// Initialize database
const db = new Database("chat.db");

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Create tables if not exist
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

// Migration updates
try {
  db.run("ALTER TABLE messages ADD COLUMN room_id TEXT REFERENCES rooms(id)");
  // Migrate existing global messages
  db.run("UPDATE messages SET room_id = 'global' WHERE recipient_id IS NULL AND room_id IS NULL");
} catch (e) {
  // Column likely exists, ignore
}

// Migration for max_users
try {
    db.run("ALTER TABLE rooms ADD COLUMN max_users INTEGER DEFAULT 0");
} catch (e) {
    // Column likely exists
}

// Ensure global room exists
try {
    const globalRoom: Room = {
        uid: "global",
        name: "Global Chat",
        type: "public",
        description: "The main gathering place for everyone."
    };
    db.query(`INSERT OR IGNORE INTO rooms (id, name, description, type) VALUES ($id, $name, $desc, $type)`)
      .run({ 
          $id: globalRoom.uid, 
          $name: globalRoom.name, 
          $desc: globalRoom.description!, 
          $type: globalRoom.type 
      });
} catch (e) {
    console.error("Error creating global room:", e);
}

// Helper functions (Typed)

export const createUser = (user: User, passhash: string | null = null, is_guest: boolean = true): boolean => {
    try {
        const query = db.query("INSERT INTO users (uid, username, data, passhash, is_guest) VALUES ($uid, $username, $data, $passhash, $is_guest)");
        query.run({
            $uid: user.uid,
            $username: user.username,
            $data: JSON.stringify(user),
            $passhash: passhash,
            $is_guest: is_guest ? 1 : 0
        });
        return true;
    } catch (error) {
        console.error("Error creating user:", error);
        return false;
    }
};

export const getUser = (uid: string): User | null => {
    const query = db.query("SELECT data FROM users WHERE uid = $uid");
    const result = query.get({ $uid: uid }) as { data: string } | null;

    if (!result) return null;
    return JSON.parse(result.data) as User;
};

export const getUserWithAuth = (username: string): { user: User, passhash: string | null } | null => {
    const query = db.query("SELECT data, passhash FROM users WHERE username = $username");
    const result = query.get({ $username: username }) as { data: string, passhash: string | null } | null;

    if (!result) return null;
    return {
        user: JSON.parse(result.data) as User,
        passhash: result.passhash
    };
};

export const getUserByUsername = (username: string): User | null => {
    const query = db.query("SELECT data FROM users WHERE username = $username");
    const result = query.get({ $username: username }) as { data: string } | null;

    if (!result) return null;
    return JSON.parse(result.data) as User;
};

export const getAllUsers = (): User[] => {
    const query = db.query("SELECT data FROM users");
    const results = query.all() as { data: string }[];
    return results.map((row) => JSON.parse(row.data) as User);
};

export const deleteUser = (uid: string): void => {
    db.query("DELETE FROM users WHERE uid = $uid").run({ $uid: uid });
};

export const updateUser = (uid: string, updates: Partial<User>): boolean => {
    const user = getUser(uid);
    if (!user) return false;

    const updatedUser = { ...user, ...updates };

    try {
        const query = db.query("UPDATE users SET data = $data WHERE uid = $uid");
        query.run({
            $data: JSON.stringify(updatedUser),
            $uid: uid
        });
        return true;
    } catch (error) {
        console.error("Error updating user:", error);
        return false;
    }
};

// Room Helpers

export const createRoom = (room: Room): boolean => {
    try {
        const query = db.query(`
            INSERT INTO rooms (id, name, description, created_by, type, max_users)
            VALUES ($id, $name, $desc, $createdBy, $type, $maxUsers)
        `);
        query.run({
            $id: room.uid,
            $name: room.name,
            $desc: room.description || null,
            $createdBy: room.createdBy || null,
            $type: room.type,
            $maxUsers: room.maxUsers || 0
        });
        return true;
    } catch (error) {
        console.error("Error creating room:", error);
        return false;
    }
};

export const updateRoom = (id: string, updates: Partial<Room>): boolean => {
    try {
        // Build dynamic query? SQLite simple updates
        // For now, let's just update all fields that might be passed?
        // Or simpler:
        const current = getRoom(id);
        if (!current) return false;

        const updated = { ...current, ...updates };

        const query = db.query(`
            UPDATE rooms 
            SET name = $name, description = $desc, max_users = $maxUsers
            WHERE id = $id
        `);
        query.run({
            $name: updated.name,
            $desc: updated.description || null,
            $maxUsers: updated.maxUsers || 0,
            $id: id
        });
        return true;
    } catch (error) {
       console.error("Error updating room", error);
       return false;
    }
}

export const deleteRoom = (id: string): boolean => {
    try {
        db.transaction(() => {
            // Delete messages?
            db.query("DELETE FROM messages WHERE room_id = $id").run({ $id: id });
            // Delete room
            db.query("DELETE FROM rooms WHERE id = $id").run({ $id: id });
        })();
        return true;
    } catch (error) {
        console.error("Error deleting room", error);
        return false;
    }
}

// Helper to get single room
export const getRoom = (id: string): Room | null => {
    const query = db.query("SELECT * FROM rooms WHERE id = $id");
    const row = query.get({ $id: id }) as any;
    if (!row) return null;
    return {
        uid: row.id,
        name: row.name,
        description: row.description,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at).getTime(),
        type: row.type as "public" | "private",
        maxUsers: row.max_users
    };
}

export const getAllRooms = (): Room[] => {
    const query = db.query("SELECT * FROM rooms");
    const results = query.all() as any[];
    return results.map(row => ({
        uid: row.id,
        name: row.name,
        description: row.description,
        createdBy: row.created_by,
        createdAt: new Date(row.created_at).getTime(),
        type: row.type as "public" | "private",
        maxUsers: row.max_users
    }));
};

// Message Helpers

export const createMessage = (msg: Message): boolean => {
    try {
        const query = db.query(`
            INSERT INTO messages (id, sender_id, recipient_id, content, timestamp, read) 
            VALUES ($id, $sender_id, $recipient_id, $room_id, $content, $timestamp, $read)
        `);
        if (!msg.senderId) {
            throw new Error("Cannot save message without senderId");
        }
        query.run({
            $id: msg.id,
            $sender_id: msg.senderId,
            $recipient_id: msg.recipientId || null,
            $room_id: msg.roomId || null,
            $content: msg.text,
            $timestamp: msg.timestamp,
            $read: msg.status === "read" ? 1 : 0
        });
        return true;
    } catch (error) {
        console.error("Error creating message:", error);
        return false;
    }
};

export const getRoomMessages = (roomId: string, limit: number = 50): Message[] => {
    const query = db.query(`
        SELECT m.id, m.sender_id, u.username as sender_name, m.content, m.timestamp, m.read, m.recipient_id, m.room_id
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE m.room_id = $roomId
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

    const rows = query.all({ $roomId: roomId, $limit: limit }) as any[];

    return rows.map(row => ({
        id: row.id,
        type: "message",
        kind: "chat",
        text: row.content,
        senderId: row.sender_id,
        senderName: row.sender_name,
        recipientId: row.recipient_id, // likely null
        roomId: row.room_id,
        timestamp: row.timestamp,
        status: row.read ? "read" : "sent"
    }));
};

export const getGlobalMessages = (limit: number = 50): Message[] => {
    return getRoomMessages('global', limit);
};

export const getDirectMessages = (userA: string, userB: string, limit: number = 50): Message[] => {
    const query = db.query(`
        SELECT m.id, m.sender_id, u.username as sender_name, m.recipient_id, m.content, m.timestamp, m.read
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE (m.sender_id = $ua AND m.recipient_id = $ub)
           OR (m.sender_id = $ub AND m.recipient_id = $ua)
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

    const rows = query.all({ $ua: userA, $ub: userB, $limit: limit }) as any[];

    return rows.map(row => ({
        id: row.id,
        type: "message",
        kind: "chat",
        text: row.content,
        senderId: row.sender_id,
        senderName: row.sender_name,
        recipientId: row.recipient_id,
        timestamp: row.timestamp,
        status: row.read ? "read" : "sent"
    }));
}

export default db;

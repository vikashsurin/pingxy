import { Database } from "bun:sqlite";
import type { User, Message } from "../../shared/src/lib/utils/validation";

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
    recipient_id TEXT, -- NULL for global chat
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(uid),
    FOREIGN KEY(recipient_id) REFERENCES users(uid)
  )
`);

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

// Message Helpers

export const createMessage = (msg: Message): boolean => {
    try {
        const query = db.query(`
            INSERT INTO messages (id, sender_id, recipient_id, content, timestamp, read) 
            VALUES ($id, $sender_id, $recipient_id, $content, $timestamp, $read)
        `);
        if (!msg.senderId) {
            throw new Error("Cannot save message without senderId");
        }
        query.run({
            $id: msg.id,
            $sender_id: msg.senderId,
            $recipient_id: msg.recipientId || null,
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

export const getGlobalMessages = (limit: number = 50): Message[] => {
    const query = db.query(`
        SELECT m.id, m.sender_id, u.username as sender_name, m.content, m.timestamp, m.read
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE m.recipient_id IS NULL
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

    const rows = query.all({ $limit: limit }) as any[];

    return rows.map(row => ({
        id: row.id,
        type: "message",
        kind: "chat",
        text: row.content,
        senderId: row.sender_id,
        senderName: row.sender_name,
        recipientId: "global",
        timestamp: row.timestamp,
        status: row.read ? "read" : "sent"
    }));
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

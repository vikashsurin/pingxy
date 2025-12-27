import { Database } from "bun:sqlite";
import type { User } from "../../shared/src/lib/utils/validation";

// Initialize database
const db = new Database("chat.db");

// Create tables if not exist
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    data JSON NOT NULL
  )
`).run();

// Helper functions (Typed)

export const createUser = (user: User): boolean => {
    try {
        const query = db.query("INSERT INTO users (uid, username, data) VALUES ($uid, $username, $data)");
        query.run({
            $uid: user.uid,
            $username: user.username,
            $data: JSON.stringify(user), // Storing full object as JSON for simplicity, given the dynamic fields
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

export default db;

import db from "../client";
import type { User } from "../../../../shared/src/lib/utils/validation";

export const getRoleByName = (roleName: string): { id: number } | null => {
    const query = db.query("SELECT id FROM roles WHERE role_name = $roleName");
    return query.get({ $roleName: roleName }) as { id: number } | null;
};

export const insertUser = (
    user: User,
    passhash: string | null = null
): void => {
    db.query(
        "INSERT INTO users (uid, username, data, passhash, roles) VALUES ($uid, $username, $data, $passhash, $roles)"
    ).run({
        $uid: user.uid,
        $username: user.username,
        $data: JSON.stringify(user),
        $passhash: passhash,
        $roles: JSON.stringify(user.roles),
    });
};

export const insertUserRole = (uid: string, roleId: number): void => {
    db.query("INSERT INTO user_roles (uid, role_id) VALUES ($uid, $roleId)").run({
        $uid: uid,
        $roleId: roleId,
    });
};

// TODO use proper typing for return values
// export interface UserRow {
//     uid: string;
//     string;
//     passhash?: string | null;
//   }

export const fetchUserByUid = (uid: string): { data: string } | null => {
    const query = db.query("SELECT data FROM users WHERE uid = $uid");
    return query.get({ $uid: uid }) as { data: string } | null;
};

export const fetchUserWithAuth = (
    username: string
): { uid: string; data: string; passhash: string | null } | null => {
    const query = db.query(
        "SELECT uid, data, passhash FROM users WHERE username = $username"
    );
    return query.get({
        $username: username,
    }) as { uid: string; data: string; passhash: string | null } | null;
};

export const fetchUserByUsername = (
    username: string
): { uid: string; data: string } | null => {
    const query = db.query(
        "SELECT uid, data FROM users WHERE username = $username"
    );
    return query.get({ $username: username }) as {
        uid: string;
        data: string;
    } | null;
};

export const fetchAllUsers = (): { uid: string; data: string }[] => {
    const query = db.query("SELECT uid, data FROM users");
    return query.all() as { uid: string; data: string }[];
};

export const removeUser = (uid: string): void => {
    db.query("DELETE FROM users WHERE uid = $uid").run({ $uid: uid });
};

export const updateUserData = (uid: string, data: string): void => {
    const query = db.query("UPDATE users SET data = $data WHERE uid = $uid");
    query.run({
        $data: data,
        $uid: uid,
    });
};

export const fetchActiveUsers = (
    nowInSeconds: number,
    thresholdSeconds: number
): { uid: string; data: string }[] => {
    return db
        .query(
            `
      SELECT u.uid, u.data
      FROM users u
      JOIN sessions s ON u.uid = s.uid
      WHERE s.expires_at > ?       
        AND s.last_activity > ?   
      GROUP BY u.uid
      ORDER BY s.last_activity DESC
  `
        )
        .all(nowInSeconds, thresholdSeconds) as { uid: string; data: string }[];
};

export const fetchUserRoles = (uid: string): { role_name: string }[] => {
    const query = db.query(`
        SELECT r.role_name 
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.uid = $uid
    `);
    return query.all({ $uid: uid }) as { role_name: string }[];
};

export const fetchUsersByRole = (
    role: string
): { uid: string; data: string }[] => {
    const query = db.query(`
        SELECT u.uid, u.data 
        FROM users u
        JOIN user_roles ur ON u.uid = ur.uid
        JOIN roles r ON ur.role_id = r.id
        WHERE r.role_name = $role
    `);
    return query.all({ $role: role }) as { uid: string; data: string }[];
};

export const fetchBanStatus = (
    uid: string,
    now: number
): { reason: string; expires_at: number | null } | null => {
    const query = db.query(`
        SELECT reason, expires_at 
        FROM banned_users 
        WHERE uid = $uid 
        AND (expires_at IS NULL OR expires_at > $now)
    `);

    return query.get({ $uid: uid, $now: now }) as {
        reason: string;
        expires_at: number | null;
    } | null;
};

export const insertBan = (
    uid: string,
    reason: string,
    bannedBy: string,
    expiresAt: number | null
): void => {
    db.query(
        `
            INSERT OR REPLACE INTO banned_users (uid, reason, banned_by, expires_at)
            VALUES ($uid, $reason, $bannedBy, $expiresAt)
        `
    ).run({
        $uid: uid,
        $reason: reason,
        $bannedBy: bannedBy,
        $expiresAt: expiresAt,
    });
};

export const removeBan = (uid: string): void => {
    db.query("DELETE FROM banned_users WHERE uid = $uid").run({ $uid: uid });
};

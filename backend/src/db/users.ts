import type { User } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied

// Helper to get role ID
const getRoleId = (roleName: string): number | null => {
  const query = db.query("SELECT id FROM roles WHERE role_name = $roleName");
  const result = query.get({ $roleName: roleName }) as { id: number } | null;
  return result ? result.id : null;
};

export const createUser = (
  user: User,
  passhash: string | null = null,
): boolean => {
  const transaction = db.transaction(() => {
    try {
      db.query(
        "INSERT INTO users (uid, username, data, passhash, roles) VALUES ($uid, $username, $data, $passhash, $roles)"
      ).run({
        $uid: user.uid,
        $username: user.username,
        $data: JSON.stringify(user),
        $passhash: passhash,
        $roles: JSON.stringify(user.roles),
      });

      for (const role of user.roles) {
        const roleId = getRoleId(role);
        if (roleId) {
          db.query(
            "INSERT INTO user_roles (uid, role_id) VALUES ($uid, $roleId)"
          ).run({
            $uid: user.uid,
            $roleId: roleId,
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error creating user/roles:", error);
      throw error; // Rollback
    }
  });

  try {
    transaction();
    return true;
  } catch (e) {
    return false;
  }
};

export const getUser = (uid: string): User | null => {
  const query = db.query("SELECT data FROM users WHERE uid = $uid");
  const result = query.get({ $uid: uid }) as { data: string } | null;

  if (!result) return null;
  const user = JSON.parse(result.data) as User;

  // Refresh roles from DB (source of truth)
  user.roles = getUserRoles(uid);
  return user;
};

export const getUserWithAuth = (
  username: string
): { user: User; passhash: string | null } | null => {
  const query = db.query(
    "SELECT uid, data, passhash FROM users WHERE username = $username"
  );
  const result = query.get({
    $username: username,
  }) as { uid: string; data: string; passhash: string | null } | null;

  if (!result) return null;
  const user = JSON.parse(result.data) as User;
  user.roles = getUserRoles(result.uid);

  return {
    user,
    passhash: result.passhash,
  };
};

export const getUserByUsername = (username: string): User | null => {
  const query = db.query("SELECT uid, data FROM users WHERE username = $username");
  const result = query.get({ $username: username }) as { uid: string; data: string } | null;

  if (!result) return null;
  const user = JSON.parse(result.data) as User;
  user.roles = getUserRoles(result.uid);
  return user;
};

export const getAllUsers = (): User[] => {
  const query = db.query("SELECT uid, data FROM users");
  const results = query.all() as { uid: string; data: string }[];
  return results.map((row) => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
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
      $uid: uid,
    });
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
};

export const getActiveUsers = (): User[] => {
  // SQLite UNIXEPOCH() uses seconds, so we convert JS milliseconds to seconds
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const activeThresholdSeconds = nowInSeconds - 30 * 60; // 30 mins ago in seconds

  const results = db
    .query(
      `
      SELECT u.uid, u.data
      FROM users u
      JOIN sessions s ON u.uid = s.uid
      WHERE s.expires_at > ?        -- Must not be expired
        AND s.last_activity > ?    -- Must have recent activity
      GROUP BY u.uid
      ORDER BY s.last_activity DESC
  `
    )
    .all(nowInSeconds, activeThresholdSeconds) as { uid: string; data: string }[];

  return results.map((row) => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
};

// -- ROLE HELPERS --

export const getUserRoles = (uid: string): any[] => {
  const query = db.query(`
        SELECT r.role_name 
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.uid = $uid
    `);
  const results = query.all({ $uid: uid }) as { role_name: string }[];
  // Cast to known types if needed, for now string array
  return results.map(r => r.role_name);
}

export const getGuests = (): User[] => {
  return getUsersByRole("guest");
};

export const getAdmins = (): User[] => {
  return getUsersByRole("admin");
};

export const getModerators = (): User[] => {
  return getUsersByRole("moderator");
};

const getUsersByRole = (role: string): User[] => {
  const query = db.query(`
        SELECT u.uid, u.data 
        FROM users u
        JOIN user_roles ur ON u.uid = ur.uid
        JOIN roles r ON ur.role_id = r.id
        WHERE r.role_name = $role
    `);
  const results = query.all({ $role: role }) as { uid: string, data: string }[];
  return results.map(row => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
}

// -- BAN HELPERS --

export const isBanned = (uid: string): { banned: boolean, reason?: string, expires_at?: number } => {
  const now = Math.floor(Date.now() / 1000);
  const query = db.query(`
        SELECT reason, expires_at 
        FROM banned_users 
        WHERE uid = $uid 
        AND (expires_at IS NULL OR expires_at > $now)
    `);

  const result = query.get({ $uid: uid, $now: now }) as { reason: string, expires_at: number | null } | null;

  if (result) {
    return { banned: true, reason: result.reason, expires_at: result.expires_at || undefined };
  }
  return { banned: false };
}

export const banUser = (uid: string, reason: string, bannedBy: string, durationSeconds: number | null = null): boolean => {
  try {
    const expiresAt = durationSeconds ? Math.floor(Date.now() / 1000) + durationSeconds : null;
    db.query(`
            INSERT OR REPLACE INTO banned_users (uid, reason, banned_by, expires_at)
            VALUES ($uid, $reason, $bannedBy, $expiresAt)
        `).run({
      $uid: uid,
      $reason: reason,
      $bannedBy: bannedBy,
      $expiresAt: expiresAt
    });
    return true;
  } catch (e) {
    console.error("Failed to ban user:", e);
    return false;
  }
}

export const unbanUser = (uid: string): void => {
  db.query("DELETE FROM banned_users WHERE uid = $uid").run({ $uid: uid });
}


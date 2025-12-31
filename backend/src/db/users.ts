import type { User } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied
import {
  getRoleByName,
  insertUser,
  insertUserRole,
  fetchUserByUid,
  fetchUserWithAuth,
  fetchUserByUsername,
  fetchAllUsers,
  removeUser,
  updateUserData,
  fetchActiveUsers,
  fetchUserRoles,
  fetchUsersByRole,
  fetchBanStatus,
  insertBan,
  removeBan,
} from "./queries/users";

export const createUser = (
  user: User,
  passhash: string | null = null
): boolean => {
  const transaction = db.transaction(() => {
    try {
      insertUser(user, passhash);

      for (const role of user.roles) {
        const roleRecord = getRoleByName(role);
        if (roleRecord) {
          insertUserRole(user.uid, roleRecord.id);
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
  const result = fetchUserByUid(uid);

  if (!result) return null;
  const user = JSON.parse(result.data) as User;

  // Refresh roles from DB (source of truth)
  user.roles = getUserRoles(uid);
  return user;
};

export const getUserWithAuth = (
  username: string
): { user: User; passhash: string | null } | null => {
  const result = fetchUserWithAuth(username);

  if (!result) return null;
  const user = JSON.parse(result.data) as User;
  user.roles = getUserRoles(result.uid);

  return {
    user,
    passhash: result.passhash,
  };
};

export const getUserByUsername = (username: string): User | null => {
  const result = fetchUserByUsername(username);

  if (!result) return null;
  const user = JSON.parse(result.data) as User;
  user.roles = getUserRoles(result.uid);
  return user;
};

export const getAllUsers = (): User[] => {
  const results = fetchAllUsers();
  return results.map((row) => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
};

export const deleteUser = (uid: string): void => {
  removeUser(uid);
};

export const updateUser = (uid: string, updates: Partial<User>): boolean => {
  const user = getUser(uid);
  if (!user) return false;

  const updatedUser = { ...user, ...updates };

  try {
    updateUserData(uid, JSON.stringify(updatedUser));
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

  const results = fetchActiveUsers(nowInSeconds, activeThresholdSeconds);

  return results.map((row) => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
};

// -- ROLE HELPERS --

export const getUserRoles = (uid: string): any[] => {
  const results = fetchUserRoles(uid);
  // Cast to known types if needed, for now string array
  return results.map((r) => r.role_name);
};

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
  const results = fetchUsersByRole(role);
  return results.map((row) => {
    const u = JSON.parse(row.data) as User;
    u.roles = getUserRoles(row.uid);
    return u;
  });
};

// -- BAN HELPERS --

export const isBanned = (
  uid: string
): { banned: boolean; reason?: string; expires_at?: number } => {
  const now = Math.floor(Date.now() / 1000);
  const result = fetchBanStatus(uid, now);

  if (result) {
    return {
      banned: true,
      reason: result.reason,
      expires_at: result.expires_at || undefined,
    };
  }
  return { banned: false };
};

export const banUser = (
  uid: string,
  reason: string,
  bannedBy: string,
  durationSeconds: number | null = null
): boolean => {
  try {
    const expiresAt = durationSeconds
      ? Math.floor(Date.now() / 1000) + durationSeconds
      : null;
    insertBan(uid, reason, bannedBy, expiresAt);
    return true;
  } catch (e) {
    console.error("Failed to ban user:", e);
    return false;
  }
};

export const unbanUser = (uid: string): void => {
  removeBan(uid);
};

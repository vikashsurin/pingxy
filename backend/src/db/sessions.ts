import type { User } from "../../../shared/src/lib/utils/validation";
import "./schema";
import {
  deleteSessionQuery,
  insertSession,
  updateSessionActivityQuery,
  validateSession,
  validateSessionById,
} from "./queries/sessions";

export const createSession = ({
  user,
  ip_address,
  user_agent,
}: {
  user: User;
  ip_address: string;
  user_agent?: string;
}) => {
  const sid = crypto.randomUUID();
  const uid = user.uid;
  const now = Math.floor(Date.now() / 1000);
  const expires_at = now + 24 * 60 * 60; // 1 day

  try {
    insertSession(sid, uid, now, expires_at, ip_address, user_agent);
  } catch (error) {
    console.error("Error creating session:", error);
  }

  return sid;
};

export const getSession = (sid: string, ip_address: string) => {
  try {
    const session = validateSession(sid, ip_address);
    if (!session) {
      deleteSession(sid);
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error validating session:", error);

    deleteSession(sid);
    return null;
  }
};

// Lookup a session by sid only (no IP binding), still enforcing expiry/last_activity
export const getSessionById = (sid: string) => {
  try {
    const session = validateSessionById(sid);
    if (!session) {
      deleteSession(sid);
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error validating session by id:", error);
    deleteSession(sid);
    return null;
  }
};

export const deleteSession = (sid: string) => {
  try {
    deleteSessionQuery(sid);
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};

export const updateSessionActivity = (sid: string) => {
  try {
    updateSessionActivityQuery(sid);
  } catch (error) {
    console.error("Error updating session activity:", error);
  }
};

export enum UserStatus {
  ONLINE = "online", // Green - Active right now
  AWAY = "away", // Yellow - Inactive for a while
  OFFLINE = "offline", // Gray - Not logged in or very inactive
}

const STATUS_THRESHOLDS = {
  ONLINE: 60, // 1 minute
  AWAY: 300, // 5 minutes
  OFFLINE: Infinity,
};

export const getUserStatus = (lastActivity: number): UserStatus => {
  const secondsSinceActivity = Math.floor(Date.now() / 1000) - lastActivity;

  if (secondsSinceActivity < STATUS_THRESHOLDS.ONLINE) {
    return UserStatus.ONLINE;
  } else if (secondsSinceActivity < STATUS_THRESHOLDS.AWAY) {
    return UserStatus.AWAY;
  } else {
    return UserStatus.OFFLINE;
  }
};

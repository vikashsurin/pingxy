import type { User } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema";

const validateSession = db.query(`
    SELECT * FROM sessions 
    WHERE sid = ? 
      AND last_activity > (UNIXEPOCH() - 1800)  -- 30 minutes
      AND expires_at > UNIXEPOCH()            
      AND ip_address = ?                      
  `);

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
    const query = db.query(
      "INSERT INTO sessions (sid, uid, last_activity, expires_at, ip_address, user_agent) VALUES ($sid, $uid, $last_activity, $expires_at, $ip_address, $user_agent)"
    );

    query.run({
      $sid: sid,
      $uid: uid,
      $last_activity: now,
      $expires_at: expires_at,
      $ip_address: ip_address,
      $user_agent: user_agent ?? "unknown",
    });
  } catch (error) {
    console.error("Error creating session:", error);
  }

  return sid;
};

export const getSession = (sid: string, ip_address: string) => {
  try {
    const session = validateSession.get(sid, ip_address);
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

export const deleteSession = (sid: string) => {
  try {
    const query = db.query("DELETE FROM sessions WHERE sid = $sid");
    query.run({ $sid: sid });
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};

export const updateSessionActivity = (sid: string) => {
  try {
    const query = db.query(
      "UPDATE sessions SET last_activity = $last_activity WHERE sid = $sid"
    );
    query.run({ $last_activity: Math.floor(Date.now() / 1000), $sid: sid });
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

// export const getActiveUsersWithStatus = () => {
//   try {
//     const users = db
//       .prepare(
//         `
//       SELECT
//         u.uid,
//         u.username,
//         u.email,
//         s.last_activity,
//         COUNT(s.sid) as active_sessions
//       FROM users u
//       INNER JOIN sessions s ON u.uid = s.uid
//       WHERE s.expires_at > ?  -- Only valid sessions
//       GROUP BY u.uid
//       ORDER BY s.last_activity DESC
//     `
//       )
//       .all(Math.floor(Date.now() / 1000));

//     const now = Math.floor(Date.now() / 1000);

//     return users.map((user) => {
//       const secondsSinceActivity = now - user.last_activity;

//       let status: UserStatus;
//       if (secondsSinceActivity < 60) {
//         status = UserStatus.ONLINE; // Active in last minute
//       } else if (secondsSinceActivity < 300) {
//         status = UserStatus.AWAY; // Active 1-5 minutes ago
//       } else {
//         status = UserStatus.OFFLINE; // 5+ minutes inactive
//       }

//       return {
//         ...user,
//         status,
//         last_seen: user.last_activity,
//       };
//     });
//   } catch (error) {
//     console.error("Error getting users with status:", error);
//     return [];
//   }
// };

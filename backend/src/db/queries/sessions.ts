import { Session } from "../../../../shared/src/lib/utils/validation";
import db from "../client";

// Validate an active session bound to a specific IP address
export const validateSession = (
  sid: string,
  ip_address: string
): Session | null => {
  const query = db.query(`
      SELECT * FROM sessions 
      WHERE sid = ? 
        AND last_activity > (UNIXEPOCH() - 1800)  -- 30 minutes
        AND expires_at > UNIXEPOCH()            
        AND ip_address = ?                      
    `);
  const session = query.get(sid, ip_address);
  return (session as Session) ?? null;
};

// Validate an active session by sid only (no IP binding)
// Useful for WebSocket upgrades where the remote IP may not be available
export const validateSessionById = (sid: string): Session | null => {
  const query = db.query(`
      SELECT * FROM sessions
      WHERE sid = ?
        AND last_activity > (UNIXEPOCH() - 1800)
        AND expires_at > UNIXEPOCH()
    `);
  const session = query.get(sid);
  return (session as Session) ?? null;
};

export const insertSession = (
  sid: string,
  uid: string,
  now: number,
  expires_at: number,
  ip_address: string,
  user_agent?: string
): void => {
  db.query(
    `
      INSERT OR REPLACE INTO sessions 
      (sid, uid, last_activity, expires_at, ip_address, user_agent) 
      VALUES ($sid, $uid, $now, $expires_at, $ip_address, $ua)
    `
  ).run({
    $sid: sid,
    $uid: uid,
    $now: now,
    $expires_at: expires_at,
    $ip_address: ip_address,
    $ua: user_agent ?? "unknown",
  });
};

export const fetchSessionQuery = (sid: string): Session => {
  const query = db.query("SELECT * FROM sessions WHERE sid = $sid");
  const session = query.get({ $sid: sid });
  return session as Session;
};

export const deleteSessionQuery = (sid: string): void => {
  const query = db.query("DELETE FROM sessions WHERE sid = $sid");
  query.run({ $sid: sid });
};

export const updateSessionActivityQuery = (sid: string): void => {
  const query = db.query(
    "UPDATE sessions SET last_activity = $last_activity WHERE sid = $sid"
  );
  query.run({ $last_activity: Math.floor(Date.now() / 1000), $sid: sid });
};

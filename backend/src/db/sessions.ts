import type { Session, User } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema";

const validateSession = db.prepare(`
    SELECT * FROM sessions 
    WHERE sid = ? 
      AND last_activity > (UNIXEPOCH() - 1800) -- Inactivity check
      AND expires_at > UNIXEPOCH()             -- Absolute expiry check
      AND ip_address = ?                       -- Optional: Network check
  `);

export const createSession = ({
  user,
  ip_address,
}: {
  user: User;
  ip_address: string;
}) => {
  const sid = crypto.randomUUID();
  const uid = user.uid;
  const expires_at = Date.now() + 24 * 60 * 60 * 1000; // 1 day
  console.log({ ip_address });
  try {
    const query = db.query(
      "INSERT INTO sessions (sid, uid, last_activity, expires_at, ip_address, user_agent) VALUES ($sid, $uid, $last_activity, $expires_at, $ip_address, $user_agent)"
    );
    query.run({
      $sid: sid,
      $uid: uid,
      $last_activity: Date.now(),
      $expires_at: expires_at,
      $ip_address: ip_address,
      $user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Error creating session:", error);
  }
  return sid;
};

export const getSession = (sid: string, ip_address: string): Session | null => {
  try {
    const session = validateSession.get(sid, ip_address);
    return (session as Session) || null;
  } catch (error) {
    console.error("Error validating session:", error);
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

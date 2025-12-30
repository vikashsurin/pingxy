import { deleteCookie, getCookie } from "hono/cookie";
import { getUser } from "../db/users";
import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";
import { getSession, updateSessionActivity } from "../db/sessions";

export const authMiddleware = async (c: Context, next: Next) => {
  const cookie = getCookie(c, "sessionid");

  if (!cookie) {
    return c.json({ message: "not logged in" }, 401);
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    const decoded = await verify(cookie, secret);

    // Extract UID and SID from the simplified payload
    const uid = decoded.uid as string;
    const sid = decoded.sid as string;
    const connInfo = getConnInfo(c);
    const ipAddress = connInfo?.remote?.address;

    if (!ipAddress) {
      return c.json({ message: "Unable to retrieve client IP" }, 400);
    }

    const session = getSession(sid, ipAddress);

    // If the session is expired due to inactivity, delete the cookie
    if (!session) {
      deleteCookie(c, "sessionid", {});
      return c.json({ message: "Session expired! Relogin" }, 401);
    }

    // Update session activity
    updateSessionActivity(sid);

    if (!uid || !sid) {
      return c.json({ message: "invalid token payload" }, 401);
    }

    const user = getUser(uid);

    if (!user) {
      return c.json({ message: "user not found" }, 401);
    }

    // Check Global Ban
    const { isBanned } = await import("../db/users"); // Lazy import to avoid circular dep if needed, or just import at top
    const banStatus = isBanned(user.uid);
    if (banStatus.banned && (!banStatus.expires_at || banStatus.expires_at * 1000 > Date.now())) {
      return c.json({
        error: "Account Suspended",
        reason: banStatus.reason,
        expiresAt: banStatus.expires_at
      }, 403);
    }

    c.set("jwtPayload", { user, sid });

    await next();
  } catch (err) {
    return c.json({ message: "invalid token" }, 401);
  }
};

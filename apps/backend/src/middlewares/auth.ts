import { deleteCookie, getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";
import * as services from "../db/services";
import { factory } from "../db/factory";

function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (fromEnv) return fromEnv;
  if (!isProd) return "fallback_secret_for_dev";
  throw new Error("JWT_SECRET is not configured in production environment");
}

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, "_Host-session");

  console.log(sessionToken)
  // No token → early exit
  if (!sessionToken) {
    // Optional: deleteCookie(c, "_Host-session"); // only if you really want to be extra clean
    return c.json({ message: "Unauthorized - please log in" }, 401);
  }

  try {
    const user = await services.getSessionUser(sessionToken);

    // Optional: you can throw specific errors from getSessionUser
    // e.g. throw new Error("session_expired") / "session_revoked" etc.

    c.set("user", user)

    // Update last activity (best effort – don't fail request if this fails)
    services.extendSessionActivity(sessionToken).catch((e) => {
      console.warn("Failed to extend session activity", e);
    });

    // IP is usually optional/nice-to-have, rarely critical
    const ip = getConnInfo(c)?.remote?.address ?? "unknown";
    // You can store it somewhere if needed, but don't fail the request
    await next();
  } catch (error) {
    // Very important: delete invalid/expired session cookie
    deleteCookie(c, "_Host-session", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax", // or "strict"
    });

    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return c.json({ message: "Session expired" }, 401);
      }
      if (error.message.includes("revoked")) {
        return c.json({ message: "Session has been revoked" }, 401);
      }
    }

    // Default case - generic invalid session
    return c.json({ message: "Invalid session" }, 401);
  }
});

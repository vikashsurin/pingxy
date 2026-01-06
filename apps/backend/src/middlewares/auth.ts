import { deleteCookie, getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { getConnInfo } from "hono/bun";
import * as db from "../db/index";
import { factory } from "../db/factory";

function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (fromEnv) return fromEnv;
  if (!isProd) return "fallback_secret_for_dev";
  throw new Error("JWT_SECRET is not configured in production environment");
}

export const authMiddleware = factory.createMiddleware(
  async (c: Context, next: Next) => {
    const cookie = getCookie(c, "_Host-session");

    if (!cookie) {
      deleteCookie(c, "_Host-session");
      return c.json({ message: "not logged in" }, 401);
    }

    try {
      const user = await db.getSessionUser(cookie);

      // Set user in the context
      c.set("user", user);

      // Update Session Activity
      await db.extendSessionAcitivity(cookie);

      const connInfo = getConnInfo(c);
      const ipAddress = connInfo?.remote?.address;

      if (!ipAddress) {
        return c.json({ message: "Unable to retrieve client IP" }, 400);
      }
    } catch (error) { }

    next();
  }
);

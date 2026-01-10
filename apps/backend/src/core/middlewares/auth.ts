import { deleteCookie, getCookie } from "hono/cookie";
import { getConnInfo } from "hono/bun";
import { factory } from "../db/drizzle-factory";
import { extendSessionActivity, getSessionUser } from "../../features/sessions";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const sessionToken = getCookie(c, "_Host-session");

  console.log(sessionToken);
  // No token → early exit
  if (!sessionToken) {
    // Optional: deleteCookie(c, "_Host-session"); // only if you really want to be extra clean
    return c.json({ message: "Unauthorized - please log in" }, 401);
  }

  try {
    const user = await getSessionUser(sessionToken);

    // Optional: you can throw specific errors from getSessionUser
    // e.g. throw new Error("session_expired") / "session_revoked" etc.
    // TODO check this
    c.set("user", user);

    // Update last activity (best effort – don't fail request if this fails)
    extendSessionActivity(sessionToken).catch((e) => {
      console.warn("Failed to extend session activity", e);
    });

    const ip = getConnInfo(c)?.remote?.address ?? "unknown";

    await next();
  } catch (error) {
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

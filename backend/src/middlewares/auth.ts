import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import type { User } from "../../../shared/src/lib/utils/validation";

import { getUser } from "../db/users";

export const authMiddleware = async (c: Context, next: Next) => {
    const cookie = getCookie(c, "sessionid");

    if (!cookie) {
        return c.json({ message: "not logged in" });
    }

    try {
        const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
        const decoded = await verify(cookie, secret);
        
        // Extract UID from the simplified payload
        const uid = decoded.uid as string;
        
        if (!uid) {
             return c.json({ message: "invalid token payload" }, 401);
        }

        const user = getUser(uid);
        
        if (!user) {
             return c.json({ message: "user not found" }, 401);
        }

        c.set("jwtPayload", { user });

        await next();
    } catch (err) {
        return c.json({ message: "invalid token" }, 401);
    }
};

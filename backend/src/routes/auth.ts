import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { User } from "../../../shared/src/lib/utils/validation.js";
import { userSockets, announcedUsers } from "../state";
import { createUser, deleteUser, getUserByUsername, getUser } from "../db";

const app = new Hono();

app.post("/login", async (c) => {
    const body = await c.req.json();
    const user: User = body.user;

    const payload: { user: User } = {
        user: user,
    };

    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    const token = await sign(payload, secret);

    setCookie(c, "sessionid", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: false,
        path: "/",
        sameSite: "lax",
    });

    // Try to create user in DB. 
    // If user exists by UID, this is a login (or update).
    // If user exists by Username but different UID, we might have an issue, but we'll assume the frontend handles checks.
    // For now we attempt creation.

    // Check if user exists first to decide logic?
    // Actually, we can just ensure they exist.
    const existing = getUser(user.uid);
    if (!existing) {
        // Create new user
        // This might fail if username is taken by ANOTHER uid (enforced by DB Unique constraint)
        const success = createUser(user);
        if (!success) {
            // If creation failed, check if it's strictly a username conflict
            const userByCheck = getUserByUsername(user.username);
            if (userByCheck && userByCheck.uid !== user.uid) {
                return c.json({ error: "Username taken" }, 409);
            }
            // Otherwise, maybe some other error?
        }
    } else {
        // User exists, we could update fields if we wanted.
        // For now, do nothing.
    }

    // We don't add to `users` map anymore.
    // We strictly use `announcedUsers` for session tracking in socketHandlers.

    // Force add to announcedUsers to prevent "Join" message if they are just logging in again?
    // Actually, new session = "Join". 
    // If they were already "Logged In" (announcedUsers has them), we merge?
    // But login usually implies fresh start.
    // The socket connection `open` handler adds to announcedUsers.
    // So we don't need to touch announcedUsers here.

    return c.json({
        uid: payload.user.uid,
        username: payload.user.username,
        token: token,
    });
});

app.post("/logout", (c) => {
    const user: User = c.get("jwtPayload")?.user;

    if (!user) {
        // If no user context, just clear cookie
        deleteCookie(c, "sessionid", {
            maxAge: 0,
            httpOnly: false,
            path: "/",
            secure: false,
            sameSite: "lax",
        });
        return c.json({ message: "logged out" });
    }

    const uid = user.uid;

    // We DO NOT delete from DB on logout. Accounts are persistent.

    // Clear session tracking
    announcedUsers.delete(uid);

    const userSocket = userSockets.get(uid);
    if (userSocket) {
        userSocket.close();
    }

    // delete user socket
    userSockets.delete(uid);

    // delete session cookie
    deleteCookie(c, "sessionid", {
        maxAge: 0,
        httpOnly: false,
        path: "/",
        secure: false,
        sameSite: "lax",
    });

    return c.json({ message: "logged out" });
});

export default app;

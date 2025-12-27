import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import type { User } from "../../../shared/src/lib/utils/validation.js";
import { users, existingUsernames, userSockets, announcedUsers } from "../state";

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

    // save user to users map
    users.set(user.uid, user);

    // save username to existingUsernames set
    existingUsernames.add(user.username);

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

    // delete user from users map
    users.delete(uid);

    // delete username from existingUsernames set
    existingUsernames.delete(user.username);
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

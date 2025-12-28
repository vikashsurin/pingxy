import { Hono } from "hono";
import type { User } from "../../../shared/src/lib/utils/validation.js";
import { capitalizeFirst } from "../../../shared/src/lib/utils/string.js";
import { createUser, deleteUser, getAllUsers, getUserByUsername, getUser, updateUser } from "../db";

const app = new Hono();

app.get("/", (c) => {
    const user: User = c.get("jwtPayload").user;

    // Ensure the current user is in the DB (recovery from inconsistent state)
    if (!getUser(user.uid)) {
        createUser(user);
    }

    return c.json({ users: getAllUsers() });
});

app.get("/check", async (c) => {
    const name: string = c.req.query("username") as string;

    const username = capitalizeFirst(name);

    if (!username) {
        return c.json(
            {
                error: "No username provided",
            },
            400
        );
    }

    // Check DB for username existence
    const existingUser = getUserByUsername(username);
    const exists = !!existingUser;

    return c.json(
        {
            username,
            exists,
            available: !exists,
        },
        200
    );
});


app.get("/me", async (c) => {
    const user = c.get("jwtPayload").user as User;
    return c.json({ user });
});

app.put("/me", async (c) => {
    const user = c.get("jwtPayload").user as User;
    const body = await c.req.json();

    // Whitelist allowed fields
    const { bio, country, gender } = body;
    const updates: Partial<User> = {};

    if (bio !== undefined) updates.bio = bio;
    if (country !== undefined) updates.country = country;
    if (gender !== undefined) updates.gender = gender;

    const success = updateUser(user.uid, updates);

    if (success) {
        return c.json({ success: true, user: getUser(user.uid) });
    } else {
        return c.json({ error: "Failed to update profile" }, 500);
    }
});

app.post("/pause", async (c) => {
    const user = c.get("jwtPayload").user as User;
    const success = updateUser(user.uid, { isPaused: true });

    if (success) {
        return c.json({ success: true });
    } else {
         return c.json({ error: "Failed to pause account" }, 500);
    }
});

// Alias for unpause if needed in future, or just toggle
app.post("/unpause", async (c) => {
    const user = c.get("jwtPayload").user as User;
    const success = updateUser(user.uid, { isPaused: false });

     if (success) {
        return c.json({ success: true });
    } else {
         return c.json({ error: "Failed to unpause account" }, 500);
    }
});

app.delete("/me", async (c) => {
    const user = c.get("jwtPayload").user as User;
    try {
        deleteUser(user.uid);
        return c.json({ success: true });
    } catch (e) {
        return c.json({ error: "Failed to delete account" }, 500);
    }
});

export default app;

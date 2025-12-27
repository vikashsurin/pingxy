import { Hono } from "hono";
import type { User } from "../../../shared/src/lib/utils/validation.js";
import { capitalizeFirst } from "../../../shared/src/lib/utils/string.js";
import { createUser, getAllUsers, getUserByUsername, getUser } from "../db";

const app = new Hono();

app.get("/", (c) => {
    const user: User = c.get("jwtPayload").user;

    // Ensure the current user is in the DB (recovery from inconsistent state)
    if (!getUser(user.uid)) {
        console.log("Restoring user to DB:", user);
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

export default app;

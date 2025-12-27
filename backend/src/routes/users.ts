import { Hono } from "hono";
import type { User } from "../../../shared/src/lib/utils/validation.js";
import { capitalizeFirst } from "../../../shared/src/lib/utils/string.js";
import { users, existingUsernames } from "../state";

const app = new Hono();

app.get("/", (c) => {
    const user: User = c.get("jwtPayload").user;

    if (!users.get(user.uid)) {
        console.log({ user });
        // on page reload save the logged in user
        users.set(user.uid, user);
        existingUsernames.add(user.username);
    }

    return c.json({ users: Array.from(users.values()) });
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
    const exists = existingUsernames.has(username);

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

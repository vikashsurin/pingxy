import { NewUser } from "@chat/shared/src/lib/utils/validation";
import { getConnInfo } from "hono/bun";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { factory } from "../../core/db/drizzle-factory";
import { authMiddleware } from "../../core/middlewares/auth.js";
import {
  createUser,
  getUserByUsername,
  getAuthUserByUsername,
  removeUser
} from "../../features/users/index";

import {
  createSession,
  revokeSession,
  getSessionUser,
} from "../../features/sessions/index";

const app = factory.createApp();

app.get("/verify", authMiddleware, async (c) => {
  return c.json({ message: "test" }, 200);
});

// Register route
app.post("/register", async (c) => {
  const body = await c.req.json();

  // Check this if user is needed here!
  const { username, password, user } = body;

  if (!username || !password || !user) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const hashed_password = await Bun.password.hash(password);

  const newUser: NewUser = {
    username: username,
    user_type: "user" as const,
    hashed_password: hashed_password,
    data: { ...user },
  };

  const success = await createUser(newUser);
  if (success.length < 0) {
    return c.json({ error: "Failed to create user" }, 500);
  }

  // Create session and auto login the user
  const info = getConnInfo(c);
  const ip_address = info.remote.address!;
  const [dbUser] = await getUserByUsername(username);
  const userAgent = c.req.header("User-Agent")!;
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }
  const token = crypto.randomUUID();

  // Create session
  await createSession(token, dbUser.id, ip_address, userAgent);

  // Set cookie
  setCookie(c, "_Host-session", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax",
  });

  return c.json({
    user: dbUser,
    token: token
  });
});

// Login route
app.post("/login", async (c) => {
  const body = await c.req.json();

  const { username, password } = body;

  console.log({ username, password });

  if (!username || !password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const { hashed_password, ...user } = await getAuthUserByUsername(username);
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await Bun.password.verify(password, hashed_password ?? "");
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const info = getConnInfo(c);
  const ip_address = info.remote.address!;
  const userAgent = c.req.header("User-Agent")!;
  const token = crypto.randomUUID();

  // Create session
  await createSession(token, user.id, ip_address, userAgent);

  // Set cookie
  setCookie(c, "_Host-session", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax",
  });

  return c.json({
    user: user,
    token: token,
  });
});

// Guest
app.post("/guest", async (c) => {
  const body = await c.req.json();

  const { user } = body;

  if (!user) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const newUser: NewUser = {
    username: user.username,
    user_type: "guest" as const,
    data: { ...user },
  };

  const success = await createUser(newUser);
  if (success.length < 0) {
    return c.json({ error: "Failed to create user" }, 500);
  }

  // Create session and auto login the user
  const info = getConnInfo(c);
  const ip_address = info.remote.address!;
  const [dbUser] = await getUserByUsername(user.username);
  const userAgent = c.req.header("User-Agent")!;
  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }
  const token = crypto.randomUUID();

  // Create session
  await createSession(token, dbUser.id, ip_address, userAgent);

  // Set cookie
  setCookie(c, "_Host-session", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "lax",
  });

  return c.json({
    user: dbUser,
    token: token,
  });
});

// Logout route
app.post("/logout", async (c) => {
  const cookie = getCookie(c, "_Host-session");
  if (!cookie) {
    return c.json({ error: "Missing Auth token" }, 401);
  }
  const user = await getSessionUser(cookie);
  const success = await revokeSession(cookie);
  if (!success) {
    throw new Error("Failed to Logout user");
  }

  deleteCookie(c, "_Host-session");

  // Remove user from services, if the user is a guest
  if (user.user_type === "guest") {
    const removed = removeUser(user.id);
    if (!removed) {
      throw new Error("Error removing Guest user");
    }
  }
  return c.json({ message: "Logged out successfully" });
});

// me
app.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export const authRouter = app;

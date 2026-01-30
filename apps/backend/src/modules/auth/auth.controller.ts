import { NewUser } from "@chat/shared/types";
import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { SessionService } from "@modules/sessions";
import { UserService } from "@modules/users";
import { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";


export const AuthController = {
  me: async (c: Context) => {
    const user = c.get("user");
    return c.json({ user });
  },

  verify: async (c: Context) => {
    return c.json({ message: "test" }, 200);
  },

  register: factory.createHandlers(
    validate('json', z.object({
      username: z.string().min(3).max(100),
      password: z.string().min(8).max(100),
    })),
    async (c: Context) => {
      try {
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

        const success = await UserService.createUser(newUser);
        if (success.length < 0) {
          return c.json({ error: "Failed to create user" }, 500);
        }

        // Create session and auto login the user
        const info = getConnInfo(c);
        const ip_address = info.remote.address!;
        const [dbUser] = await UserService.getUserByUsername(username);
        const userAgent = c.req.header("User-Agent")!;
        if (!dbUser) {
          return c.json({ error: "User not found" }, 404);
        }
        const token = crypto.randomUUID();

        // Create session
        await SessionService.createSession(token, dbUser.id, ip_address, userAgent);

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
      } catch (error) { }
    }),

  login: factory.createHandlers(
    validate('json', z.object({
      username: z.string().min(3).max(100),
      password: z.string().min(8).max(100),
    })),
    async (c) => {
      try {
        const { username, password } = c.req.valid('json')

        const { hashed_password, ...user } =
          await UserService.getAuthUserByUsername(username);
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
        await SessionService.createSession(token, user.id, ip_address, userAgent);

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
      } catch (error) { }
    }),

  guest: async (c: Context) => {
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

    const success = await UserService.createUser(newUser);
    if (success.length < 0) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create session and auto login the user
    const info = getConnInfo(c);
    const ip_address = info.remote.address!;
    const [dbUser] = await UserService.getUserByUsername(user.username);
    const userAgent = c.req.header("User-Agent")!;
    if (!dbUser) {
      return c.json({ error: "User not found" }, 404);
    }
    const token = crypto.randomUUID();

    // Create session
    await SessionService.createSession(token, dbUser.id, ip_address, userAgent);

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
  },

  logout: async (c: Context) => {
    const cookie = getCookie(c, "_Host-session");
    if (!cookie) {
      return c.json({ error: "Missing Auth token" }, 401);
    }
    const user = await SessionService.getSessionUser(cookie);
    const success = await SessionService.revokeSession(cookie);
    if (!success) {
      throw new Error("Failed to Logout user");
    }

    deleteCookie(c, "_Host-session");

    // Remove user from services, if the user is a guest
    if (user.user_type === "guest") {
      const removed = UserService.removeUser(user.id);
      if (!removed) {
        throw new Error("Error removing Guest user");
      }
    }
    return c.json({ message: "Logged out successfully" });
  },
};

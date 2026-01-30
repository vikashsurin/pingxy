import {
  GuestUserRequestSchema,
  RegisterUserRequestSchema,
} from "@chat/shared/domain/user";
import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { SessionService } from "@modules/sessions";
import { UserService } from "@modules/users";
import { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { AuthService } from "./auth.service";

export const AuthController = {
  me: async (c: Context) => {
    const user = c.get("user");
    return c.json({ user });
  },

  verify: async (c: Context) => {
    return c.json({ message: "test" }, 200);
  },

  register: factory.createHandlers(
    validate("json", RegisterUserRequestSchema),
    async (c) => {
      try {
        // Todo: Remove confirm password
        const body = c.req.valid("json");
        const info = getConnInfo(c);
        const ip_address = info.remote.address!;
        const userAgent = c.req.header("User-Agent")!;

        const { user, token } = await AuthService.register({
          body,
          info,
          ip_address,
          userAgent,
        });

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
    },
  ),

  login: factory.createHandlers(
    validate(
      "json",
      z.object({
        username: z.string().min(3).max(100),
        password: z.string().min(8).max(100),
      }),
    ),
    async (c) => {
      try {
        const info = getConnInfo(c);
        const ip_address = info.remote.address!;
        const userAgent = c.req.header("User-Agent")!;

        const { username, password } = c.req.valid("json");

        const { user, token } = await AuthService.login({
          username,
          password,
          info,
          ip_address,
          userAgent,
        });

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
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to login user" }, 500);
      }
    },
  ),

  guest: factory.createHandlers(
    validate("json", GuestUserRequestSchema),
    async (c) => {
      const info = getConnInfo(c);
      const ip_address = info.remote.address!;
      const userAgent = c.req.header("User-Agent")!;

      const body = c.req.valid("json");

      const { user, token } = await AuthService.guest({
        body,
        info,
        ip_address,
        userAgent,
      });

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
    },
  ),

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

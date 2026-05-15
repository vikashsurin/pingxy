import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import {
  GuestUserRequestSchema,
  RegisterUserRequestSchema,
} from "@pingxy/shared/domain/user";
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
        console.log({ body })

        const info = getConnInfo(c);
        const ipAddress = info.remote.address!;
        const userAgent = c.req.header("User-Agent")!;
        const { user, token } = await AuthService.register({
          body,
          info,
          ipAddress,
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
        email: z.email(),
        password: z.string().min(2).max(100),
      }),
    ),
    async (c) => {
      try {
        const info = getConnInfo(c);
        const ipAddress = info.remote.address!;
        const userAgent = c.req.header("User-Agent")!;

        const { email, password } = c.req.valid("json");


        const { user, token } = await AuthService.login({
          email,
          password,
          info,
          ipAddress,
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
      const ipAddress = info.remote.address!;
      const userAgent = c.req.header("User-Agent")!;

      const body = c.req.valid("json");

      const { user, token } = await AuthService.guest({
        body,
        info,
        ipAddress,
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

    const success = await AuthService.logout(cookie);
    if (!success) {
      return c.json({ error: "Failed to logout user" }, 500);
    }

    deleteCookie(c, "_Host-session");
    return c.json({ message: "Logged out successfully" });
  },
};

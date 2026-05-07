import { capitalizeFirst } from "@pingxy/shared/utils";
import { validate } from "@lib/utils/validator";
import { z } from "zod";
import { UserService } from "./user.service";
import { factory } from "@lib/db/drizzle-factory";

export const UserController = {
  checkUser: factory.createHandlers(
    validate(
      "query",
      z.object({
        userName: z
          .string()
          .min(3, "Too short")
          .max(20, "Too long")
          .regex(/^[a-zA-Z0-9]+$/, "Invalid userName"),
      }),
    ),
    async (c) => {
      try {
        const userName = c.req.valid("query").userName;

        const UserName = capitalizeFirst(userName ?? "");
        let available: boolean;
        const result = await UserService.getUserByUsername(UserName);

        if (result.length > 0) {
          available = false;
        } else {
          available = true;
        }

        return c.json({ available: available });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Something went wrong" }, 500);
      }
    },
  ),

  getUserById: factory.createHandlers(
    validate(
      "param",
      z.object({
        id: z.coerce.number(),
      }),
    ),
    async (c) => {
      try {
        const { id } = c.req.valid("param");

        const user = await UserService.getUserById(id);

        if (!user) {
          return c.json({ error: "User not found" }, 404);
        }

        return c.json(user);
      } catch (error) {
        console.error(error);
        return c.json({ error: "Something went wrong" }, 500);
      }
    },
  ),
};

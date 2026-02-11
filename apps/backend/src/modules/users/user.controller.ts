import { capitalizeFirst } from "@pingxy/shared/utils";
import { validate } from "@common/utils/validator";
import { z } from "zod";
import { UserService } from "./user.service";
import { factory } from "src/common/db/drizzle-factory";

export const UserController = {
  checkUser: factory.createHandlers(
    validate(
      "query",
      z.object({
        username: z
          .string()
          .min(3, "Too short")
          .max(20, "Too long")
          .regex(/^[a-zA-Z0-9]+$/, "Invalid username"),
      }),
    ),
    async (c) => {
      try {
        const username = c.req.valid("query").username;

        const UserName = capitalizeFirst(username ?? "");
        let available: boolean;
        const result = await UserService.getUserByUsername(UserName);

        if (result.length > 0) {
          available = false;
        } else {
          available = true;
        }

        return c.json({ available: available });
      } catch (error) {
        console.log(error);
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
        console.log(error);
        return c.json({ error: "Something went wrong" }, 500);
      }
    },
  ),
};

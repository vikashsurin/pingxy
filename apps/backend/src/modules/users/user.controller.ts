import { capitalizeFirst } from "@chat/shared/utils";
import { Context } from "hono";
import { UserService } from "./user.service";

export const UserController = {
  checkUser: async (c: Context) => {
    try {
      const username = c.req.query("username");
      if (!username || username === "") {
        return c.json({ error: "username cannot be empty" }, 400);
      }

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
};

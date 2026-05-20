import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import { profileCreateSchema } from "@pingxy/shared/domain";
import { ProfileService } from "./profile.service";
import z from "zod";

export const ProfileController = {
  createProfile: factory.createHandlers(
    validate('json', profileCreateSchema), async (c) => {
      const user = c.get("user");

      const { gender, age, country, bio } = c.req.valid("json");

      console.log("gender", gender, "age", age, "country", country, "bio", bio)

      const profile = await ProfileService.createProfile(user.id, { gender, age, country, bio });

      return c.json(profile, 201);
    }
  ),

  updateProfile: factory.createHandlers(
    validate('json', profileCreateSchema),
    async (c) => {
      const user = c.get("user");
      const { gender, age, country, bio } = c.req.valid("json");

      const profile = await ProfileService.updateProfile(user.id, { gender, age, country, bio });

      return c.json(profile, 200);
    }
  ),

  deleteProfile: factory.createHandlers(
    validate('param', z.object({ id: z.coerce.number() })),
    async (c) => {
      const { id } = c.req.valid("param");

      await ProfileService.deleteProfile(id);

      return c.json({ message: "Profile deleted" }, 200);
    }
  ),

}

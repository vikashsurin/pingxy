import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import { profileCreateSchema, profileUpdateSchema } from "@pingxy/shared/domain";
import { ProfileService } from "./profile.service";

export const ProfileController = {
  createProfile: factory.createHandlers(
    validate('json', profileCreateSchema), async (c) => {
      const user = c.get("user");

      const { gender, age, country, bio } = c.req.valid("json");


      const profile = await ProfileService.createProfile(user.id, { gender, age, country, bio });

      return c.json(profile, 201);
    }
  ),

  getProfile: factory.createHandlers(
    async (c) => {
      const user = c.get("user");

      const profile = await ProfileService.getProfile(user.id);

      return c.json(profile, 200);
    }
  ),

  updateProfile: factory.createHandlers(
    validate('json', profileUpdateSchema),
    async (c) => {
      const user = c.get("user");
      const { gender, age, country, bio } = c.req.valid("json");


      const profile = await ProfileService.updateProfile(user.id, { gender, age, country, bio });

      return c.json(profile, 200);
    }
  ),

  deleteProfile: factory.createHandlers(
    async (c) => {
      const user = c.get("user");

      await ProfileService.deleteProfile(user.id);

      return c.json({ message: "Profile deleted" }, 200);
    }
  ),

}

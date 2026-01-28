import * as schema from "../db/schemas";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const userInsertSchema = createInsertSchema(schema.users);
export const userSelectSchema = createSelectSchema(schema.users);
export const userUpdateSchema = createUpdateSchema(schema.users);

export const blockedUserInsertSchema = createInsertSchema(schema.blocked_users);
export const blockedUserSelectSchema = createSelectSchema(schema.blocked_users);
export const blockedUserUpdateSchema = createUpdateSchema(schema.blocked_users);

export type User = typeof schema.users.$inferSelect;
export type PublicUser = Omit<User, "hashed_password"> & {
  data: {
    gender: string;
    age: number;
    bio: string;
    country: string;
    roles: string[];
  };
};
export type NewUser = typeof schema.users.$inferInsert;
export type update = Partial<typeof schema.users.$inferInsert>;

export type BlockedUser = typeof schema.blocked_users.$inferSelect;
export type NewBlockedUser = typeof schema.blocked_users.$inferInsert;
export type UpdateBlockedUser = Partial<
  typeof schema.blocked_users.$inferInsert
>;

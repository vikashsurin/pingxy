import { NewUser } from "@chat/shared/domain/user";
import { eq } from "drizzle-orm";
import db from "src/common/db/client";
import { userInsertSchema, users } from "@chat/shared/db/schemas";

export const UserRepository = {
  insert: async (newUser: NewUser) => {
    const user = userInsertSchema.parse(newUser);
    return await db.insert(users).values(user).returning();
  },

  // PS: Dont return hashed_password
  selectById: async (id: number) => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        user_type: users.user_type,
        data: users.data,
        last_seen_at: users.last_seen_at,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id));
  },

  selectForAuth: async (username: string) => {
    return await db.select().from(users).where(eq(users.username, username));
  },

  selectByUsername: async (username: string) => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        user_type: users.user_type,
        data: users.data,
        last_seen_at: users.last_seen_at,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.username, username));
  },

  selectAll: async () => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        user_type: users.user_type,
        data: users.data,
        last_seen_at: users.last_seen_at,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  },

  update: async (id: number, data: {}) => {
    return await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(Date.now()),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        user_type: users.user_type,
        data: users.data,
        last_seen_at: users.last_seen_at,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });
  },

  delete: async (id: number) => {
    return await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
    });
  },
};

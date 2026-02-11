import { users } from "@pingxy/shared";
import { NewUser } from "@pingxy/shared/domain/user";
import { eq, inArray } from "drizzle-orm";
import db, { DB_TX } from "src/common/db/client";

import { insertUserSchema } from "@pingxy/shared/domain/user";

export const UserRepository = {
  insert: async (newUser: NewUser) => {
    const user = insertUserSchema.parse(newUser);
    return await db.insert(users).values(user).returning();
  },

  // PS: Dont return hashedPassword
  selectById: async (id: number) => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        userType: users.userType,
        data: users.data,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
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
        userType: users.userType,
        data: users.data,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.username, username));
  },

  selectManyByIds: async ({ ids, tx = db }: { ids: number[], tx?: DB_TX }) => {
    return await tx
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(inArray(users.id, ids));
  },

  selectAll: async () => {
    return await db
      .select({
        id: users.id,
        username: users.username,
        userType: users.userType,
        data: users.data,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  },

  update: async (id: number, data: {}) => {
    return await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(Date.now()),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        userType: users.userType,
        data: users.data,
        lastSeenAt: users.lastSeenAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
  },

  delete: async (id: number) => {
    return await db.delete(users).where(eq(users.id, id)).returning({
      id: users.id,
      username: users.username,
      userType: users.userType,
      data: users.data,
      lastSeenAt: users.lastSeenAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
  },
};

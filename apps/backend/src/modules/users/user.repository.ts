import { users } from "@pingxy/shared";
import { NewUser } from "@pingxy/shared/domain/user";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import db, { DB_TX } from "@lib/db/client";

import { insertUserSchema } from "@pingxy/shared/domain/user";

const { hashedPassword, createdAt, updatedAt, ...safeUserColumns } = getTableColumns(users)
export { safeUserColumns }

export const UserRepository = {
  insert: async (newUser: NewUser) => {
    const user = insertUserSchema.parse(newUser);
    return await db.insert(users).values(user).returning(safeUserColumns);
  },

  // PS: Dont return hashedPassword
  selectById: async (id: number) => {
    return await db
      .select({
        ...safeUserColumns,
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
        ...safeUserColumns
      })
      .from(users)
      .where(eq(users.username, username));
  },

  selectManyByIds: async ({
    ids,
    tx = db,
  }: {
    ids: number[];

    tx?: DB_TX;
  }) => {
    const u = users;
    return await tx
      .select({
        ...safeUserColumns,
      })
      .from(u)
      .where(inArray(u.id, ids));
  },

  selectAll: async () => {
    return await db
      .select({
        ...safeUserColumns
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
        ...safeUserColumns
      });
  },


  delete: async (id: number) => {
    return await db.delete(users).where(eq(users.id, id)).returning({
      ...safeUserColumns
    });
  },
};

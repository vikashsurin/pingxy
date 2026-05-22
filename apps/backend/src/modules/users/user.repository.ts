import db, { DB_TX } from "@lib/db/client";
import { users } from "@pingxy/shared";
import { NewUser } from "@pingxy/shared/domain/user";
import { eq, getTableColumns, inArray } from "drizzle-orm";

import { insertUserSchema } from "@pingxy/shared/domain/user";

const { hashedPassword, createdAt, updatedAt, email, ...safeUserColumns } =
  getTableColumns(users);
export { safeUserColumns };

export const UserRepository = {
  insert: async (newUser: NewUser) => {
    const user = insertUserSchema.parse(newUser);

    return await db
      .insert(users)
      .values(user)
      .returning(safeUserColumns);
  },

  selectForAuth: async (id: number) => {
    return await db
      .select()
      .from(users)
      .where(eq(users.id, id));
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

  selectByEmail: async (email: string) => {
    return await db
      .select()
      .from(users)
      .where(eq(users.email, email as unknown as string));
  },

  selectByUsername: async (userName: string) => {
    return await db
      .select({
        ...safeUserColumns,
      })
      .from(users)
      .where(eq(users.userName, userName));
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
        ...safeUserColumns,
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
        ...safeUserColumns,
      });
  },

  updatePassword: async (id: number, hashedPassword: string) => {
    return await db
      .update(users)
      .set({
        hashedPassword,
        updatedAt: new Date(Date.now()),
      })
      .where(eq(users.id, id))
      .returning({
        ...safeUserColumns,
      });
  },

  delete: async (id: number) => {
    return await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        ...safeUserColumns,
      });
  },
};

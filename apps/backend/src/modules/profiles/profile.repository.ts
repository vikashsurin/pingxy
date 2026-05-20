import db, { DB_TX } from "@lib/db/client";
import { profiles } from "@pingxy/shared/domain";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { users } from "@pingxy/shared/domain";

export const ProfileRepository = {
  insert: async (profile: any, tx: DB_TX = db) => {
    const row = await tx
      .insert(profiles)
      .values(profile)
      .returning({
        id: profiles.id,
        userId: profiles.userId,
        gender: profiles.gender,
        age: profiles.age,
        country: profiles.country,
        bio: profiles.bio,
        userName: sql`(SELECT ${users.userName} FROM ${users} WHERE ${users.id} = ${profiles.userId})`.as("userName"),
      });
    return row[0];
  },
  update: async (id: number, profile: any, tx: DB_TX = db) => {
    const row = await tx
      .update(profiles)
      .set(profile)
      .where(eq(profiles.id, id))
      .returning();
    return row;
  },
  selectById: async (id: number, tx: DB_TX = db) => {
    const row = await tx
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));
    return row;
  },
  selectByUserId: async (userId: number, tx: DB_TX = db) => {
    const row = await tx
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return row;
  },
  delete: async (id: number, tx: DB_TX = db) => {
    const row = await tx
      .delete(profiles)
      .where(eq(profiles.id, (id)))
      .returning();
    return row;
  },

}


import db from "../client";
import { NewUser, User, userInsertSchema, users } from "../schema";
import { eq } from "drizzle-orm";



export const insertUser = async (newUser: NewUser) => {
  const user = userInsertSchema.parse(newUser)
  return await db.insert(users).values(user).returning();
};


// PS: Dont return passhash
export const selectUserById = async (id: string) => {
  return await db
    .select({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users).where(eq(users.id, id));
};

export const selectUserWithAuth = async (username: string) => {
  return await db
    .select({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
      passhash: users.passhash,
    }).from(users).where(eq(users.username, username));
}

export const selectUserByUsername = async (username: string) => {
  return await db
    .select({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users).where(eq(users.username, username));
};

export const selectAllUsers = async () => {
  return await db
    .select({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users);
}

export const updateUser = async (id: string, data: {}) => {
  return await db
    .update(users)
    .set({
      ...data,
      updated_at: Math.floor(Date.now() / 1000),
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
    })
}

export const deleteUser = async (id: string) => {
  return await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
}



import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { users } from "../schema/_schema";
import { NewUser } from "@chat/shared/src/lib/utils/validation";
import * as queries from "../queries/users.query";

describe("Users Table Schema", async () => {
  beforeAll(async () => {
    // Clear table before tests if needed
    // await db.delete(users);
  });

  const userId = 5;
  const userName = "TestUser1";
  test("should insert a user", async () => {
    const newUser: NewUser = {
      user_type: "user" as const,
      username: userName,
      hashed_password: "password",
      data: { role: "admin" },
    };
    const result = await queries.insertUser(newUser);
    expect(result).toHaveLength(1);
  });

  test("should select a user by id", async () => {
    const result = await queries.selectUserById(userId);
    expect(result).toHaveLength(1);
  });

  test("should select a user by username", async () => {
    const result = await queries.selectUserByUsername(userName);
    console.log(result[0].username);
    expect(result).toHaveLength(1);
  });

  test("should select all users", async () => {
    const result = await queries.selectAllUsers();
    expect(result).toBeArray();
  });

  test("should select a user with auth", async () => {
    const result = await queries.selectAuthUserByUsername(userName);
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe(userName);
  });

  test("should update a user", async () => {
    const result = await queries.updateUser(userId, {
      username: "Test User 2",
    });
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("Test User 2");
  });

  test("should delete a user", async () => {
    const result = await queries.deleteUser(userId);
    expect(result).toHaveLength(1);
  });
});

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import * as queries from "./internal/user.queries";
import { type NewUser } from "@chat/shared/types";

describe("Users Table Schema", async () => {
  beforeAll(async () => {
    // Clear table before tests if needed
    // await db.delete(users);
  });

  const userId = 3;
  const userName = "TestUser2";

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
      username: "TestUser2",
    });
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("TestUser2");
  });

  test("should delete a user", async () => {
    const result = await queries.deleteUser(userId);
    expect(result).toHaveLength(1);
  });
});

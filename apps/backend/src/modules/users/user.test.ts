import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { UserRepository } from "./user.repository";
import { NewUser } from "@pingxy/shared/domain/user";



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
    const result = await UserRepository.insert(newUser);
    expect(result).toHaveLength(1);
  });

  test("should select a user by id", async () => {
    const result = await UserRepository.selectById(userId);
    expect(result).toHaveLength(1);
  });

  test("should select a user by username", async () => {
    const result = await UserRepository.selectByUsername(userName);
    console.log(result[0].username);
    expect(result).toHaveLength(1);
  });

  test("should select all users", async () => {
    const result = await UserRepository.selectAll();
    expect(result).toBeArray();
  });

  test("should select a user with auth", async () => {
    const result = await UserRepository.selectForAuth(userName);
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe(userName);
  });

  test("should update a user", async () => {
    const result = await UserRepository.update(userId, {
      username: "TestUser2",
    });
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe("TestUser2");
  });

  test("should delete a user", async () => {
    const result = await UserRepository.delete(userId);
    expect(result).toHaveLength(1);
  });
});

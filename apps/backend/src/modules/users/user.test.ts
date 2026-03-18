import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { UserRepository } from "./user.repository";
import { NewUser } from "@pingxy/shared/domain/user";
import { UserService } from "./user.service";

describe("Users Table Schema", async () => {
  beforeAll(async () => {
    // Clear table before tests if needed
    // await db.delete(users);
  });

  const userId = 4;
  const userName = "TestUser2";

  test("should return all users", async () => {
    const result = await UserRepository.selectAll();
    console.log({ result });
    expect(result).toBeArray();
  });

  test("should insert a user", async () => {
    const newUser: NewUser = {
      username: 'Ritika',
      type: "user" as const,
      hashedPassword: "password",
      gender: "female" as const,
      age: 18,
      country: "AF",
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

  test("should return a user", async () => {
    const user = await UserRepository.selectById(userId);
    console.log({ user });
    expect(user).toBeDefined();
  });

  test("should return a user", async () => {
    const user = await UserService.getUserById(userId);
    console.log({ user });
  });

  test("should return many users", async () => {
    const users = await UserRepository.selectManyByIds({ ids: [24, 25, 26, 27] });
    console.log({ users });
  });

  test.only("should update last seen", async () => {
    const result = await UserService.updateLastSeen(25)
    expect(result).toHaveLength(1);
    expect(result[0].lastSeenAt).toBeDefined();
  });
});

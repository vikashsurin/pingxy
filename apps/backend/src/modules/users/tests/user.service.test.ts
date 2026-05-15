import { describe, it, expect } from "bun:test";
import { UserService } from "../user.service";

describe("UserService", () => {
  it("should create a user ", async () => {
    const user = await UserService.createUser({
      userName: "Jacob",
      type: "user",
      email: "sfsfs@sfsdf.com",
      hashedPassword: "sdfsdfsdf",
    })
    expect(user).toBeDefined();
  });
});

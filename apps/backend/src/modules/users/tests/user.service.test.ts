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

  it('should update a user password', async () => {
    const updatedUser = await UserService.updatePassword(2, '2345', '1234')
    console.log({ updatedUser })
    expect(updatedUser).toBeDefined();
  });
});

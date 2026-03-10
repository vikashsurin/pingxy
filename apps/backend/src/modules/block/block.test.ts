import { beforeAll, describe, expect, it } from "bun:test";
import { BlocksRepository } from "./block.repository";
import { BlockService } from "./block.service";

describe("BlocksRepository", () => {
  beforeAll(async () => {});

  it("should block a user", async () => {
    const blockedUser = await BlocksRepository.insert({
      blockerId: 2,
      blockedId: 5,
    });
    expect(blockedUser).toBeDefined();
  });

  const blockId = 5;
  it("should unblock a user", async () => {
    const blockedUser = await BlocksRepository.deleteById({ blockId });
    console.log({ blockedUser });
    expect(blockedUser).toBeDefined();
  });

  it("should select blocked user", async () => {
    const blockedUser = await BlocksRepository.selectById({ blockId });
    console.log({ blockedUser });
    expect(blockedUser).toBeDefined();
  });

  const blockerId = 2;

  it("should select all blocked users", async () => {
    const blockedUsers = await BlocksRepository.selectAllBlocked({ blockerId });
    console.log({ blockedUsers });
    expect(blockedUsers).toBeArray();
  });

  const blockedId = 5;

  it("should select blocked user", async () => {
    const blockedUsers = await BlocksRepository.selectUnique({
      blockerId,
      blockedId,
    });
    console.log({ blockedUsers });
    expect(blockedUsers).toBeDefined();
  });

  it.only("should check if block exists", async () => {
    const exists = await BlocksRepository.exists({
      blockerId: 5,
      blockedId: 9,
    });
    console.log({ exists });
    expect(exists).toBeBoolean();
  });

  it("should count blocked users", async () => {
    const count = await BlocksRepository.countBlocked({ blockerId });
    console.log({ count });
    expect(count).toBeNumber();
  });

  it("should select all blocks", async () => {
    const blocks = await BlocksRepository.selectAll();
    console.log({ blocks });
    expect(blocks).toBeArray();
  });

  it("should list blocked users with info", async () => {
    const blockedUsers = await BlockService.listBlockedUsersWithInfo({
      blockerId: 2,
    });
    console.log("blocked Users:", blockedUsers);
    expect(blockedUsers).toBeArray();
  });
});

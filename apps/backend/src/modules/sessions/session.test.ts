import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { NewSession, Session } from "@pingxy/shared/types";
import { SessionRepository } from "./session.repository";
describe("Sessions Table Schema", async () => {
  beforeAll(async () => {
    // await db.delete(sessions);
  });

  afterAll(async () => {
    // await db.delete(sessions);
  });

  const userId = 1;
  const sid = "123";
  test("should insert a session", async () => {
    const session: NewSession = {
      ipAddress: "127.0.0.1",
      hashedToken: "hashed_token_example",
      userId: userId,
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 60,
      lastActivity: Math.floor(Date.now() / 1000),
    };
    const result = await SessionRepository.insertSession(session);
    expect(result).toHaveLength(1);
  });

  test("should select a session", async () => {
    const result = await SessionRepository.selectSession(sid);
    expect(result).toHaveLength(1);
  });

  test("should update session activity", async () => {
    const updatedResult = await SessionRepository.updateSessionActivity(sid);
    expect(updatedResult).toHaveLength(1);
  });

  test("should delete a session", async () => {
    const deletedResult = await SessionRepository.deleteSession(sid);
    expect(deletedResult).toHaveLength(1);
  });
});

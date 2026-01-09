import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { sessions } from "../schema/_schema";
import { NewSession } from "@chat/shared/src/lib/utils/validation";
import * as queries from "../queries/sessions.query";
describe("Sessions Table Schema", async () => {
  beforeAll(async () => {
    // await db.delete(sessions);
  });

  afterAll(async () => {
    // await db.delete(sessions);
  });

  const userId = 1;
  const sid = 123;
  test("should insert a session", async () => {
    const session: NewSession = {
      ip_address: "127.0.0.1",
      hashed_token: "hashed_token_example",
      user_id: userId,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      last_activity: Math.floor(Date.now() / 1000),
    };
    const result = await queries.insertSession(session);
    expect(result).toHaveLength(1);
  });

  test("should select a session", async () => {
    const result = await queries.selectSession(sid);
    expect(result).toHaveLength(1);
  });

  test("should update session activity", async () => {
    const updatedResult = await queries.updateSessionActivity(sid);
    expect(updatedResult).toHaveLength(1);
  });

  test("should delete a session", async () => {
    const deletedResult = await queries.deleteSession(sid);
    expect(deletedResult).toHaveLength(1);
  });
});

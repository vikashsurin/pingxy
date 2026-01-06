import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../client";
import { participants } from "../schema/_schema";
import { NewParticipant } from "@chat/shared/src/lib/utils/validation";
import * as queries from "../queries/participants.query";

describe("Participants Table Schema", () => {
  beforeAll(async () => {
    await db.delete(participants);
  });

  afterAll(async () => {
    await db.delete(participants);
  });

  test("should insert a new participant", async () => {
    const newParticipant: NewParticipant = {
      conversation_id: 7,
      user_id: 1,
      role: "member" as const,
      joined_at: Math.floor(Date.now() / 1000),
      left_at: Math.floor(Date.now() / 1000),
      is_active: true,
    };
    const result = await queries.insertParticipant(newParticipant);
    expect(result).toHaveLength(1);
  });
});

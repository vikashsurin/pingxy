import { NewParticipant } from "@chat/shared/src/lib/utils/validation";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../../../core/db/client";
import { participants } from "../../../core/db/schema";
import * as queries from "./internal/participants.queries";

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
      joined_at: new Date(Date.now()),
      left_at: new Date(Date.now()),
      is_active: true,
    };
    const result = await queries.insertParticipant(newParticipant);
    expect(result).toHaveLength(1);
  });
});

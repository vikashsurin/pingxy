import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as queries from "@features/conversations/participants/internal/participants.queries";

describe("Participants Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(participants);
  });

  afterAll(async () => {
    // await db.delete(participants);
  });

  // test("should insert a new participant", async () => {
  //   const newParticipant: NewParticipant = {
  //     conversation_id: 7,
  //     user_id: 1,
  //     role: "member" as const,
  //     joined_at: new Date(Date.now()),
  //     left_at: new Date(Date.now()),
  //     is_active: true,
  //   };
  //   const result = await queries.insertParticipant(newParticipant);
  //   expect(result).toHaveLength(1);
  // });


  test("should get if a participant is valid", async () => {
    const participant = await queries.selectParticipant({ conversation_id: 2, user_id: 2 });
    expect(participant).toBeTruthy();
  })
});

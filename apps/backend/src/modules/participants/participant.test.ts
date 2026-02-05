import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ParticipantRepository } from './participant.repository'
describe("Participants Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(participants);
  });

  afterAll(async () => {
    // await db.delete(participants);
  });

  // test("should insert a new participant", async () => {
  //   const newParticipant: NewParticipant = {
  //     conversationId: 7,
  //     userId: 1,
  //     role: "member" as const,
  //     joinedAt: new Date(Date.now()),
  //     leftAt: new Date(Date.now()),
  //     isActive: true,
  //   };
  //   const result = await queries.insertParticipant(newParticipant);
  //   expect(result).toHaveLength(1);
  // });

  test("should get if a participant is valid", async () => {
    const participant = await ParticipantRepository.selectParticipant({
      conversationId: 2,
      userId: 2,
    });
    expect(participant).toBeTruthy();
  });
});

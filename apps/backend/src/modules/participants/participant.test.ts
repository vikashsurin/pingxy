import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ParticipantRepository } from "./participant.repository";
import { ParticipantService } from "./participant.service";
describe("Participants Table Schema", () => {
  beforeAll(async () => {
    // await db.delete(participants);
  });

  afterAll(async () => {
    // await db.delete(participants);
  });

  test.only("should insert a new participant", async () => {
    const newParticipant = {
      conversationId: 2,
      userId: 3,
      role: "member" as const,
      joinedAt: new Date(Date.now()),
      leftAt: new Date(Date.now()),
      isActive: true,
    };
    const result =
      await ParticipantRepository.insertParticipant(newParticipant);
    expect(result).toHaveLength(1);
  });

  test("should get if a participant is valid", async () => {
    const participant = await ParticipantRepository.selectParticipant({
      conversationId: 2,
      userId: 2,
    });
    expect(participant).toBeTruthy();
  });

  test("should get many participants by many conversation ids", async () => {
    const participants =
      await ParticipantRepository.selectManyParticipantsByManyConversationIds({
        conversationIds: [3, 4, 5],
      });
    console.log({ participants });
    expect(participants).toBeTruthy();
  });

  test("should select all participants", async () => {
    const participants =
      await ParticipantRepository.selectParticipantsByConversationId(4);
    console.log({ participants });
    expect(participants).toBeTruthy();
  });
});

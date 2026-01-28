import { NewParticipant } from "@chat/shared/types";
import db from "src/common/db/client";
import { ParticipantRepository } from "./participant.repository";

export const ParticipantService = {

  create: async ({
    conversation_id,
    user1_id,
    user2_id,
  }: {
    conversation_id: number;
    user1_id: number;
    user2_id: number;
  }) => {
    try {
      return await db.transaction(async (tx) => {
        const [p1] = await ParticipantRepository.insertParticipant(
          {
            conversation_id,
            user_id: user1_id,
            role: "member",
            joined_at: new Date(Date.now()),
            is_active: true,
          },
          tx,
        );
        const [p2] = await ParticipantRepository.insertParticipant(
          {
            conversation_id,
            user_id: user2_id,
            role: "member",
            joined_at: new Date(Date.now()),
            is_active: true,
          },
          tx,
        );
        return { sender: p1, recipient: p2 };
      });
    } catch (error) {
      console.error("Error creating participants:", error);
      throw new Error("Error creating participants");
    }
  },

  getById: async (participant_id: number) => {
    try {
      return await ParticipantRepository.selectParticipantById(participant_id);
    } catch (error) {
      console.error("Error getting participant by id:", error);
      throw new Error("Error getting participant by id");
    }
  },

  isParticipant: async ({
    conversation_id,
    user_id,
  }: {
    conversation_id: number;
    user_id: number;
  }) => {
    try {
      return await ParticipantRepository.selectParticipant({ conversation_id, user_id });
    } catch (error) {
      console.error("Error getting participant:", error);
      throw new Error("Error getting participant");
    }
  },

  getParticipantsByConversationId: async (
    conversation_id: number,
  ) => {
    try {
      return await ParticipantRepository.selectParticipantsByConversationId(conversation_id);
    } catch (error) {
      console.error("Error getting participants by conversation id:", error);
      throw new Error("Error getting participants by conversation id");
    }
  },

  changeParticipantRole: async (
    conversationId: number,
    userId: number,
    role: "admin" | "moderator" | "member",
  ) => {
    try {
      return await ParticipantRepository.updateParticipantRole(conversationId, userId, role);
    } catch (error) {
      console.error("Error updating participant role:", error);
      throw new Error("Error updating participant role");
    }
  },

  removeParticipant: async (
    conversationId: number,
    participantId: number,
  ) => {
    try {
      return await ParticipantRepository.deleteParticipant(conversationId, participantId);
    } catch (error) {
      console.error("Error removing participant:", error);
      throw new Error("Error removing participant");
    }
  },

}

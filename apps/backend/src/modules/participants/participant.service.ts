import db from "@lib/db/client";
import { eventBus } from "@lib/events";
import { createServerEvent } from "@lib/socket/socket.factory";
import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { updatePartReqSchema, User } from "@pingxy/shared/domain";
import z from "zod";
import { ParticipantRepository } from "./participant.repository";
import { broadcast } from "@lib/socket/pubsub";

export const ParticipantService = {
  // Todo: create multiple participants for  group
  // or change name , symantically
  create: async ({
    conversationId,
    user1Id,
    user2Id,
  }: {
    conversationId: number;
    user1Id: number;
    user2Id: number;
  }) => {
    try {
      return await db.transaction(async (tx) => {
        const p1 = await ParticipantRepository.insertParticipant(
          {
            conversationId,
            userId: user1Id,
            role: "member",
            joinedAt: new Date(Date.now()),
            isActive: true,
          },
          tx,
        );
        const p2 = await ParticipantRepository.insertParticipant(
          {
            conversationId,
            userId: user2Id,
            role: "member",
            joinedAt: new Date(Date.now()),
            isActive: true,
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

  updateParticipant: async (payload: z.infer<typeof updatePartReqSchema>['payload'], user: User) => {
    const { lastReadMessageId, lastDeliveredMessageId, conversationId, senderId } = payload;
    // let updatedParticipant;
    try {
      const update = async () => {

        if (lastDeliveredMessageId) {
          const updatedParticipant = await ParticipantRepository.update({
            userId: user.id,
            conversationId,
            lastDeliveredMessageId,
            lastDeliveredAt: new Date(),
          })

          return updatedParticipant;
        } else {
          const updatedParticipant = await ParticipantRepository.update({
            userId: user.id,
            conversationId,
            lastReadMessageId,
            lastReadAt: new Date(),
          })

          return updatedParticipant;
        }
      }

      const [updatedParticipant] = await update();

      const responseEnvelope = createServerEvent(SERVER_EVENTS.PARTICIPANTS.UPDATED, {
        id: updatedParticipant.id,
        userId: updatedParticipant.userId,
        conversationId: updatedParticipant.conversationId,
        lastReadMessageId: updatedParticipant.lastReadMessageId ?? undefined,
        lastReadAt: updatedParticipant.lastReadAt ?? undefined,
        lastDeliveredMessageId: updatedParticipant.lastDeliveredMessageId ?? undefined,
        lastDeliveredAt: updatedParticipant.lastDeliveredAt ?? undefined,
        senderId,
      })


      broadcast(SERVER_EVENTS.PARTICIPANTS.UPDATED, responseEnvelope)


      return updatedParticipant;

    } catch (error) {
      console.error("Error updating participant:", error);
      throw new Error("Error updating participant");
    }
  },

  getById: async (participantId: number) => {
    try {
      return await ParticipantRepository.selectParticipantById(participantId);
    } catch (error) {
      console.error("Error getting participant by id:", error);
      throw new Error("Error getting participant by id");
    }
  },

  isParticipant: async ({
    conversationId,
    userId,
  }: {
    conversationId: number;
    userId: number;
  }) => {
    try {
      return await ParticipantRepository.selectParticipant({
        conversationId,
        userId,
      });
    } catch (error) {
      console.error("Error getting participant:", error);
      throw new Error("Error getting participant");
    }
  },

  getParticipantsByConversationId: async (conversationId: number) => {
    try {
      return await ParticipantRepository.selectParticipantsByConversationId(
        conversationId,
      );
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
      return await ParticipantRepository.updateParticipantRole(
        conversationId,
        userId,
        role,
      );
    } catch (error) {
      console.error("Error updating participant role:", error);
      throw new Error("Error updating participant role");
    }
  },

  removeParticipant: async (conversationId: number, participantId: number) => {
    try {
      return await ParticipantRepository.deleteParticipant(
        conversationId,
        participantId,
      );
    } catch (error) {
      console.error("Error removing participant:", error);
      throw new Error("Error removing participant");
    }
  },



  incrementUnreadCount: async ({
    conversationId,
    senderId,
  }: {
    conversationId: number;
    senderId: number;
  }) => {
    try {
      return await ParticipantRepository.incrementUnreadCount({
        conversationId,
        senderId,
      });
    } catch (error) {
      console.error("Error updating unread count:", error);
      throw new Error("Error updating unread count");
    }
  },
  resetUnreadCount: async ({
    readerId,
    conversationId,
    messageId,
  }: {
    readerId: number;
    conversationId: number;
    messageId: number;
  }) => {
    try {
      return await ParticipantRepository.resetUnreadCount({
        readerId,
        conversationId,
        messageId
      });
    } catch (error) {
      console.error("Error updating unread count:", error);
      throw new Error("Error updating unread count");
    }
  },
};

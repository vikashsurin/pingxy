import { NewParticipant } from "@chat/shared/src/lib/utils/validation";
import * as queries from './internal/participants.queries'
import db from '../../../core/db/client'

export const createParticipant = async (participant: NewParticipant) => {
  try {
    return await queries.insertParticipant(participant);
  } catch (error) {
    console.error("Error creating participant:", error);
    throw new Error("Error creating participant");
  }
};

export const createParticipants = async ({
  conversation_id,
  user1_id,
  user2_id }: {
    conversation_id: number;
    user1_id: number;
    user2_id: number;
  }) => {
  try {

    return await db.transaction(async (tx) => {
      const [p1] = await queries.insertParticipant({
        conversation_id,
        user_id: user1_id,
        role: "member",
        joined_at: new Date(Date.now()),
        is_active: true,
      }, tx);
      const [p2] = await queries.insertParticipant({
        conversation_id,
        user_id: user2_id,
        role: "member",
        joined_at: new Date(Date.now()),
        is_active: true,
      }, tx)
      return { sender: p1, recipient: p2 }
    })

  } catch (error) {
    console.error("Error creating participants:", error);
    throw new Error("Error creating participants");
  }
};

export const getParticipantById = async (participant_id: number) => {
  try {
    return await queries.selectParticipantById(participant_id);
  } catch (error) {
    console.error("Error getting participant by id:", error);
    throw new Error("Error getting participant by id");
  }
};

export const isParticipant = async (
  {
    conversation_id, user_id
  }: {
    conversation_id: number, user_id: number
  }) => {
  try {
    return await queries.selectParticipant(conversation_id, user_id);
  } catch (error) {
    console.error("Error getting participant:", error);
    throw new Error("Error getting participant");
  }
};

export const getParticipantsByConversationId = async (
  conversation_id: number
) => {
  try {
    return await queries.selectParticipantsByConversationId(conversation_id);
  } catch (error) {
    console.error("Error getting participants by conversation id:", error);
    throw new Error("Error getting participants by conversation id");
  }
};

export const changeParticipantRole = async (
  conversationId: number,
  userId: number,
  role: "admin" | "moderator" | "member"
) => {
  try {
    return await queries.updateParticipantRole(conversationId, userId, role);
  } catch (error) {
    console.error("Error updating participant role:", error);
    throw new Error("Error updating participant role");
  }
};

export const removeParticipant = async (
  conversationId: number,
  participantId: number
) => {
  try {
    return await queries.deleteParticipant(conversationId, participantId);
  } catch (error) {
    console.error("Error removing participant:", error);
    throw new Error("Error removing participant");
  }
};

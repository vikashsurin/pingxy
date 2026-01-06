import { conversationInsertSchema, NewConversation, NewParticipant } from '@chat/shared/src/lib/utils/validation';

import * as queries from "./queries/index";
import db from './client';
import { insertParticipant } from './queries';

export const createConversation = async (conversation: NewConversation) => {
  try {
    return await queries.insertConversation(conversation);
  }
  catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Error creating conversation");
  }
}
export const createNewConversation = async (
  newConversation: NewConversation,
  user_id_1: number,
  user_id_2: number) => {
  return await db.transaction(async (tx) => {

    // Check if conversation exists
    const [existing] = await queries.selectExistingDirectConversation(user_id_1, user_id_2, tx)

    if (!existing) {
      const [conversation] = await queries.insertConversation(newConversation, tx)

      if (!conversation) {
        throw new Error("Error creating New Conversation")
      }
      const newParticipant1: NewParticipant = {
        conversation_id: conversation.conversation_id,
        user_id: user_id_1,
        role: 'member'
      }


      const [participant1] = await queries.insertParticipant(
        newParticipant1,
        tx)

      if (!participant1) {
        throw new Error("Error inserting New Participant")
      }

      const newParticipant2: NewParticipant = {
        conversation_id: conversation.conversation_id,
        user_id: user_id_2,
        role: 'member'

      }
      const [participant2] = await insertParticipant(
        newParticipant2,
        tx)

      if (!participant2) {
        throw new Error("Error inserting New Participant")
      }

      return { conversation, participant1, participant2 }
    }
    return { existing }

  })
}


export const getConversationById = async (conversation_id: number) => {
  try {
    return await queries.selectConversationById(conversation_id);
  }
  catch (error) {
    console.error("Error getting conversation by id:", error);
    throw new Error("Error getting conversation by id");
  }
}


export const removeConversation = async (conversation_id: number) => {
  try {
    return await queries.deleteConversation(conversation_id);
  }
  catch (error) {
    console.error("Error removing conversation:", error);
    throw new Error("Error removing conversation");
  }
}

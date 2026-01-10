import {
  NewConversation,
} from "@chat/shared/src/lib/utils/validation";

import * as queries from './internal/conv.queries'

export const createConversation = async (conversation: NewConversation) => {
  try {
    return await queries.insertConversation(conversation);

  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Ersror creating conversation");
  }
};

export const conversationExists = () => { }

export const findConversation = async (participantIds: number[]) => {
  // try {
  //   return await queries.selectConversationByParticipantIds(participantIds);
  // } catch (error) {
  //   console.error("Error finding conversation:", error);
  //   throw new Error("Error finding conversation");
  // }
}

export const findConversationByUsers = async ({ userId1, userId2 }: { userId1: number, userId2: number }) => {
  try {
    return await queries.selectConversationByUsersPrecise(userId1, userId2);
  } catch (error) {
    console.error("Error finding conversation by user ids:", error);
    throw new Error("Error finding conversation by user ids");
  }
}



export const findOrCreateConversationByUsers = async ({ userId1, userId2 }: { userId1: number, userId2: number }) => {
  try {
    const result = await findConversationByUsers({ userId1, userId2 });

    if (result) {
      return result.conversation
    }

    const [conversation] = await createConversation({
      conversation_type: 'direct',
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now())
    })

    return conversation

  } catch (error) {
    console.error("Error finding or creating conversation", error);
    throw new Error("Internal Server Error");
  }
}

export const findConversationByParticipant = async (participantIds: number[]) => {
  // try {
  //   return await queries.selectConversationByParticipantIds(participantIds);
  // } catch (error) {
  //   console.error("Error finding conversation by participant ids:", error);
  //   throw new Error("Error finding conversation by participant ids");
  // }
}





export const getConversation = async (conversation_id: number) => {
  try {
    return await queries.selectConversationById(conversation_id);
  } catch (error) {
    console.error("Error getting conversation by id:", error);
    throw new Error("Error getting conversation by id");
  }
};

export const getConversationsByUser = async ({ user_id }: { user_id: number }) => {
  try {
    return await queries.selectConversationsByUserId(user_id);
  } catch (error) {
    console.error("Error getting conversations by user id:", error);
    throw new Error("Error getting conversations by user id");
  }
};

export const removeConversation = async (conversation_id: number) => {
  try {
    return await queries.deleteConversation(conversation_id);
  } catch (error) {
    console.error("Error removing conversation:", error);
    throw new Error("Error removing conversation");
  }
};


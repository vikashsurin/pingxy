import { NewMessage } from '@chat/shared/src/lib/utils/validation';
import * as queries from "../queries/index";
import * as services from '../services/index';

export const createMessage = async ({ recipient_id, message }:
  { recipient_id: number, message: NewMessage }) => {
  try {
    const conversation = await services.findOrCreateConversationByUser({
      userId1: message.sender_id,
      userId2: recipient_id
    })

    if (!conversation) throw new Error("Conversation does not exits")


    const participant = await services.createParticipants({
      conversation_id: conversation.conversation_id,
      user1_id: message.sender_id,
      user2_id: recipient_id,
    })

    if (!participant) throw new Error("Error creating participants")



    const [insertedMessage] = await queries.insertMessage({
      conversation_id: conversation.conversation_id,
      client_message_id: message.client_message_id,
      sender_id: message.sender_id,
      content: message.content,
      created_at: message.created_at,
      updated_at: message.updated_at,
      deleted_at: message.deleted_at,
    })
    return {
      message: insertedMessage,
      conversation_id: conversation.conversation_id,
      sender: participant.sender,
      recipient: participant.recipient
    }

  } catch (error) {
    console.error("Error creating message:", error);
    throw new Error("Error creating message");
  }
}

export const getMessageById = async (message_id: number) => {
  try {
    return await queries.selectMessageById(message_id);
  }
  catch (error) {
    console.error("Error getting message by id:", error);
    throw new Error("Error getting message by id");
  }
}
export const getConversationMessages = async (
  {
    conversation_id,
    user_id
  }: {
    conversation_id: number,
    user_id: number
  }) => {
  try {
    const [participant] = await services.isParticipant({ conversation_id, user_id })
    if (!participant) throw new Error("Not a participant")

    return await queries.selectMessagesByConversationId(conversation_id);
  }
  catch (error) {
    console.error("Error getting messages by conversation id:", error);
    throw new Error("Error getting messages by conversation id");
  }
}



export const getMessagesBySenderId = async (sender_id: number) => {
  try {
    return await queries.selectMessagesBySenderId(sender_id);
  }
  catch (error) {
    console.error("Error getting messages by sender id:", error);
    throw new Error("Error getting messages by sender id");
  }
}

export const changeMessage = async (message_id: number, message: Partial<NewMessage>) => {
  try {
    return await queries.updateMessage(message_id, message);
  }
  catch (error) {
    console.error("Error updating message:", error);
    throw new Error("Error updating message");
  }
}

export const removeMessage = async (message_id: number) => {
  try {
    return await queries.deleteMessage(message_id);
  }
  catch (error) {
    console.error("Error deleting message:", error);
    throw new Error("Error deleting message");
  }
}

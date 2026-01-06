import { NewMessage } from '@chat/shared/src/lib/utils/validation';
import * as queries from "./queries/messages.query"

export const createMessage = async (message: NewMessage) => {
  try {
    return await queries.insertMessage(message);
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

export const getMessagesByConversationId = async (conversation_id: number) => {
  try {
    return await queries.selectMessagesByConversationId(conversation_id);
  }
  catch (error) {
    console.error("Error getting messages by conversation id:", error);
    throw new Error("Error getting messages by conversation id");
  }
}

export const getMessagesBySenderId = async (sender_id: string) => {
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

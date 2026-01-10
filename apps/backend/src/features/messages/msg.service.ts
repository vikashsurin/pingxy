import { NewMessage } from '@chat/shared/src/lib/utils/validation';
import * as queries from './internal/msg.queries';
import { findOrCreateConversationByUsers } from '../conversations';
import { createParticipants, isParticipant } from '../conversations/participants';
import { createMessageReceipt } from './receipts';


export const createMessage = async ({ recipient_id, message }:
  { recipient_id: number, message: NewMessage }) => {
  try {

    // Check if conversation exists
    // If not create
    const conversation = await findOrCreateConversationByUsers({
      userId1: message.sender_id,
      userId2: recipient_id
    })

    if (!conversation) throw new Error("Conversation does not exits")

    // Create Participant
    const participant = await createParticipants({
      conversation_id: conversation.conversation_id,
      user1_id: message.sender_id,
      user2_id: recipient_id,
    })

    if (!participant) throw new Error("Error creating participants")

    // Create Message
    const [insertedMessage] = await queries.insertMessage({
      conversation_id: conversation.conversation_id,
      client_message_id: message.client_message_id,
      sender_id: message.sender_id,
      content: message.content,
    })

    // Create message receipts
    const messageReceipt = await createMessageReceipt({
      message_id: insertedMessage.message_id!,
      user_id: recipient_id,
      status: 'sent'
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
export const getMessagesByConversation = async (
  {
    conversation_id,
    user_id
  }: {
    conversation_id: number,
    user_id: number
  }) => {
  try {
    const [participant] = await isParticipant({ conversation_id, user_id })
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

import { publish } from '@core/socket/pubsub';
import * as queries from './internal/receipt.queries';
import { MessagePayload } from '@chat/shared/types';


export const createMessageReceipt = async ({
  conversation_id,
  message_id,
  user_id,
  status
}: {
  conversation_id: number,
  message_id: number,
  user_id: number,
  status: 'sent' | 'delivered' | 'read'
}) => {
  const messageReceipt = await queries.insertMessageReceipt({
    conversation_id,
    message_id,
    user_id,
    status
  });
  return messageReceipt;
}

export const markAllAsRead = async (messagePayload: MessagePayload) => {
  const conversation_id = messagePayload.data?.conversation_id;
  const user_id = messagePayload.data?.user_id;
  const ack_user_id = messagePayload.recipient?.id!


  if (conversation_id && user_id) {
    const messageReceipts = await queries.updateAllMessageReceiptsToRead({
      conversation_id,
      user_id,
    });
    const read: MessagePayload = {
      type: 'receipt_update',
      id: messagePayload.id,
      msgData: {
        receipt: messageReceipts
      }
    }
    publish(`inbox:${ack_user_id}`, JSON.stringify(read))

    return messageReceipts;
  }
  return null;
}


export const markAsDelivered = async (messagePayload: MessagePayload) => {
  const message_id = messagePayload.data?.message_id!;
  const user_id = messagePayload.data?.user_id!;
  const ack_user_id = messagePayload.recipient?.id!

  console.log("marking as delivered::", message_id, user_id)

  const messageReceipt = await queries.updateMessageReceiptToDelivered({
    message_id,
    user_id
  });

  const delivered: MessagePayload = {
    type: 'receipt_update',
    id: messagePayload.id,
    msgData: {
      receipt: messageReceipt
    }
  }
  publish(`inbox:${ack_user_id}`, JSON.stringify(delivered))

  return messageReceipt;
}


export const markAsRead = async (messagePayload: MessagePayload) => {
  const message_id = messagePayload.data?.message_id!;
  const user_id = messagePayload.data?.user_id!;
  const ack_user_id = messagePayload.recipient?.id!


  const messageReceipt = await queries.updateMessageReceiptToRead({
    message_id,
    user_id
  });

  const read: MessagePayload = {
    type: 'receipt_update',
    id: messagePayload.id,
    msgData: {
      receipt: messageReceipt
    }
  }
  publish(`inbox:${ack_user_id}`, JSON.stringify(read))

  return messageReceipt;
}


// export const markAsSent = async ({
//   message_id,
//   user_id
// }: {
//   message_id: number,
//   user_id: number
// }) => {
//   const messageReceipt = await queries.updateMessageReceiptToSent({
//     message_id,
//     user_id
//   });
//   return messageReceipt;
// }

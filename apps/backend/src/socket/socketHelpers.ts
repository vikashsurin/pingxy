import { type MessagePayload } from '@chat/shared/src/lib/utils/validation';
import { userSockets } from '../state';

export function getOnlineUsers() {
  const users = [];

  for (const [id, data] of userSockets.entries()) {
    users.push({
      conversation_id: null,
      user: {
        ...data.user
      }
    })
  }
  return users;
}

export function getStatus(lastActivity: any) {
  const idleTime = Date.now() - lastActivity;

  if (idleTime > 5 * 60 * 1000) return 'away';
  if (idleTime > 2 * 60 * 1000) return 'idle';
  return 'online'
}


export function broadcastOnlineUsers() {
  const onlineUsers = getOnlineUsers()
  const message: MessagePayload = {
    type: 'users_online',
    id: crypto.randomUUID(),
    data: {
      users: getOnlineUsers()
    },
  };

  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message))
    } catch (error) {
      console.error(`Failed to send to user ${id}: `, error)
    }
  }
  console.log(`Broadcasted online users: ${onlineUsers.length} users`)
}

export function broadcastUserOffline(userId: number, username: string) {
  userSockets.delete(userId)
  const message: MessagePayload = {
    type: 'user_offline',
    id: crypto.randomUUID(),
    // users: {
    //   id: userId,
    //   username: username,
    // }
  };


  for (const [id, data] of userSockets.entries()) {
    try {
      data.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send to user ${id}:`, error);
    }
  }
}



// REDUNDANT
// function getConnectionStatus(id: string): Connection["status"] {
// return userSockets.has(id) ? "reconnect" : "join";
// }

// function getConnectionText(username: string, status: Connection["status"]) {
//   return `${username} has ${status === "reconnect" ? "reconnected" : "joined the chat"
//     }.`;
// }

// function handleReadReceipt(msg: ReadReceipt): boolean {
//   const result = readReceiptSchema.safeParse(msg);
//   if (!result.success) return false;

//   const success = markMessagesAsRead(
//     result.data.recipientId,
//     result.data.senderId
//   );
//   const recipientSocket = userSockets.get(result.data.recipientId);
//   if (success && recipientSocket) {
//     recipientSocket.send(JSON.stringify(result.data));
//   }
//   return true;
// }

// // temporary
// function markMessagesAsRead(recipientId: string, senderId: string): boolean {
//   return true;
// }
// function handleTypingEvent(msg: any, ws: any) {
//   // ws passed for room broadcast
//   const result = typingEventSchema.safeParse(msg);
//   if (!result.success) return;
//   const validMsg = result.data;

//   if (validMsg.recipientId) {
//     const recipientSocket = userSockets.get(validMsg.recipientId);
//     if (recipientSocket) {
//       recipientSocket.send(JSON.stringify(validMsg));
//     }
//   }
// }

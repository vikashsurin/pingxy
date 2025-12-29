import type { WebSocketHandler } from "bun";
import { validateConnection, validateMessage } from "./utils";
import {
  type Connection,
  type User,
  readReceiptSchema,
  typingEventSchema,
  roomSchema,
  editRoomSchema,
  kickUserSchema,
} from "../../shared/src/lib/utils/validation.js";
import { userSockets, announcedUsers, roomUsers } from "./state";
import { createMessage, getGlobalMessages, getDirectMessages, getAllRooms, createRoom, getRoomMessages, updateRoom, deleteRoom, getRoom } from "./db";

type WebSocketData = {
  user: User;
};

export const socketHandlers: WebSocketHandler<WebSocketData> = {
  data: {} as WebSocketData,
  open(ws) {


    console.log(`${ws.data.user.username} joined`);

    // auto subscribe to the global channel
    ws.subscribe("global");

    // Send available rooms with user counts
    const rooms = getAllRooms();
    // Populate user counts
    const roomsWithCounts = rooms.map(r => ({
      ...r,
      userCount: roomUsers.get(r.uid)?.size || 0
    }));

    ws.send(JSON.stringify({
      type: "room_list",
      rooms: roomsWithCounts
    }));

    // Send history for global chat
    // Use getRoomMessages for 'global'
    const globalMsgs = getRoomMessages('global', 20); 

    // We send them as individual messages.
    for (const msg of globalMsgs) {
      ws.send(JSON.stringify(msg));
    }

    const uid = ws.data.user.uid;
    const isAnnounced = announcedUsers.has(uid);

    if (!isAnnounced) {
      const status = getConnectionStatus(uid);
      const text = getConnectionText(ws.data.user.username, status);

      // updated connection
      const connection: Connection = {
        type: "connection",
        status,
        text,
        user: ws.data.user,
      };

      // connection object
      const validConnection = validateConnection(connection);
      if (!validConnection) return;

      ws.publish("global", JSON.stringify(validConnection));
      announcedUsers.add(uid);
    } else {
      // Just send to the user so they know they are connected
      // We can reuse the connection structure or just a simpleack?
      // Let's send a "reconnect" status just to them.
      const connection: Connection = {
        type: "connection",
        status: "reconnect",
        text: `Welcome back ${ws.data.user.username}`,
        user: ws.data.user,
      };
      const validConnection = validateConnection(connection);
      if (validConnection) {
        ws.send(JSON.stringify(validConnection));
      }
    }

    // save the userSocket
    userSockets.set(ws.data.user.uid, ws);
  },

  message(ws, message) {
    if (typeof message !== "string") return;

    let msg: any;
    try {
      msg = JSON.parse(message);
    } catch {
      return;
    }

    if (!msg || typeof msg !== "object") return;

    // Handle read receipts and typing events
    if (msg.type === "read_receipt") {
      handleReadReceipt(msg);
      return;
    }

    if (msg.type === "typing") {
      handleTypingEvent(msg, ws);
      return;
    }

    // Handle Room Events
    if (msg.type === "create_room") {
       const result = roomSchema.safeParse(msg.room);
       if (result.success) {
          const room = result.data;
          room.createdBy = ws.data.user.uid;
          if (createRoom(room)) {
             // Broadcast to global that a new room exists
             const event = JSON.stringify({ type: "room_created", room });
             ws.publish("global", event);
             ws.send(event); // Send to self too
             
             // Auto-join creator
             ws.subscribe(room.uid);
          }
       }
       return;
    }

    if (msg.type === "join_room") {
        const { roomId } = msg;
        if (roomId && typeof roomId === "string") {
            const userId = ws.data.user.uid;
            
            // Check limits
            const room = getRoom(roomId);
            if (room && room.maxUsers && room.maxUsers > 0) {
                const currentCount = roomUsers.get(roomId)?.size || 0;
                if (currentCount >= room.maxUsers) {
                    // Send error - maybe toast type?
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Room is full"
                    }));
                    return;
                }
            }

            // Track user
            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Set());
            }
            roomUsers.get(roomId)?.add(userId);

            ws.subscribe(roomId);
            // Send history
            const history = getRoomMessages(roomId, 20);
            for (const m of history) {
                ws.send(JSON.stringify(m));
            }

            // Broadcast update count?
            broadcastRoomUpdate(roomId);
        }
        return;
    }

    if (msg.type === "leave_room") {
        const { roomId } = msg;
        if (roomId && typeof roomId === "string") {
            const userId = ws.data.user.uid;
            
            ws.unsubscribe(roomId);
            
            // Remove tracking
            if (roomUsers.has(roomId)) {
                roomUsers.get(roomId)?.delete(userId);
                broadcastRoomUpdate(roomId);
            }
        }
        return;
    }

    if (msg.type === "edit_room") {
        const result = editRoomSchema.safeParse(msg);
        if (result.success) {
            const { roomId, ...updates } = result.data;
            const room = getRoom(roomId);
            
            // Authorization: Only owner can edit
            if (room && room.createdBy === ws.data.user.uid) {
                if (updateRoom(roomId, updates)) {
                    broadcastRoomUpdate(roomId);
                }
            }
        }
        return;
    }

    if (msg.type === "delete_room") {
        const { roomId } = msg;
        const room = getRoom(roomId);
        
        if (room && room.createdBy === ws.data.user.uid) {
            if (deleteRoom(roomId)) {
                // Remove from memory
                roomUsers.delete(roomId);
                
                // Broadcast deletion
                const event = JSON.stringify({ type: "room_deleted", roomId });
                ws.publish("global", event); // Announce to everyone
                ws.publish(roomId, event); // Announce to those inside (to kick them out basically)
                // Everyone in "global" should remove it from list.
                // Clients should handle activeChat switch.
            }
        }
        return;
    }

    if (msg.type === "kick_user") {
        const result = kickUserSchema.safeParse(msg);
        if (result.success) {
            const { roomId, userId } = result.data;
            const room = getRoom(roomId);
            
            // Auth check
            if (room && room.createdBy === ws.data.user.uid) {
                const targetSocket = userSockets.get(userId);
                
                // Remove from room tracking
                roomUsers.get(roomId)?.delete(userId);
                
                if (targetSocket) {
                    targetSocket.unsubscribe(roomId);
                    targetSocket.send(JSON.stringify({
                        type: "kicked",
                        roomId,
                        roomName: room.name
                    }));
                }

                broadcastRoomUpdate(roomId);
            }
        }
        return;
    }

    // Handle regular messages
    msg.senderId = ws.data.user.uid;
    msg.senderName = ws.data.user.username;

    // Ensure ID exists (if not provided by frontend)
    if (!msg.id) {
      msg.id = crypto.randomUUID();
    }

    const validMessage = validateMessage(msg);
    if (!validMessage) return;

    // Persist message
    createMessage(validMessage);

    const recipientSocket = userSockets.get(validMessage.recipientId);

    if (recipientSocket) {
      recipientSocket.send(JSON.stringify(validMessage));
      // Also send to self (sender) if it wasn't optimistic?
      // Usually sender has it.
    } else {
      // Check if it is a Room Message
      if (validMessage.roomId) {
         ws.publish(validMessage.roomId, JSON.stringify(validMessage));
         // Note: publish does not send to self.
      } else if (validMessage.recipientId) {
        // DM but user offline
        // Do nothing, they will fetch on load.
      } else {
         // Fallback to global if no roomId and no recipientId (should handle by roomId='global')
         // But for now, if roomId is missing, we might assume global or error.
         // Since we migrated, roomId should be sent.
         // If validMessage.roomId is set to 'global' above, it falls into previous block.
      }
    }
  },

  close(ws) {
    console.log("closed connection");
    const uid = ws.data.user.uid;


    // Always clean up the socket
    userSockets.delete(uid);

    // Clean up room tracking
    // Clean up room tracking
    Array.from(roomUsers.entries()).forEach(([roomId, users]) => {
        if (users.delete(uid)) {
            broadcastRoomUpdate(roomId);
        }
    });

    // Only broadcast "leave" if the user is truly gone (logged out)
    // This prevents "flickering" presence when reloading or closing tabs but staying logged in.
    if (announcedUsers.has(uid)) return;

    const connection: Connection = {
      type: "connection",
      status: "leave",
      text: `${ws.data.user.username} has left the chat.`,
      user: ws.data.user,
    };

    const validConnection = validateConnection(connection);
    if (validConnection) {
      ws.publish("global", JSON.stringify(validConnection));
    }
  },
};

// --- Helpers ---

function getConnectionStatus(uid: string): Connection["status"] {
  return userSockets.has(uid) ? "reconnect" : "join";
}

function getConnectionText(username: string, status: Connection["status"]) {
  return `${username} has ${status === "reconnect" ? "reconnected" : "joined the chat"}.`;
}

function handleReadReceipt(msg: any) {
  const result = readReceiptSchema.safeParse(msg);
  if (!result.success) return;
  const validMsg = result.data;
  // TODO: Update read status in DB?
  const recipientSocket = userSockets.get(validMsg.recipientId);
  if (recipientSocket) {
    recipientSocket.send(JSON.stringify(validMsg));
  }
}

function handleTypingEvent(msg: any, ws: any) { // ws passed for room broadcast
  const result = typingEventSchema.safeParse(msg);
  if (!result.success) return;
  const validMsg = result.data;
  
  if (validMsg.roomId) {
      // Broadcast to room
      ws.publish(validMsg.roomId, JSON.stringify(validMsg));
  } else if (validMsg.recipientId) {
      const recipientSocket = userSockets.get(validMsg.recipientId);
      if (recipientSocket) {
        recipientSocket.send(JSON.stringify(validMsg));
      }
  }
}



function broadcastRoomUpdate(roomId: string) {
    const room = getRoom(roomId);
    if (!room) return;
    
    // Add dynamic count
    // roomUsers iteration needs downlevelIteration or simpler loop if spread unavailable
    // But map.get returns Set, so .size is safe.
    room.userCount = roomUsers.get(roomId)?.size || 0;
    
    // Send to everyone (so they see updated count in list, or name change)
    // "global" channel is best for list updates
    userSockets.forEach((ws: any) => {
        // Optimally, only send if something relevant changed.
        ws.send(JSON.stringify({
            type: "room_updated",
            room
        }));
    });
}

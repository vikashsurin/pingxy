import type { Message, Room } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied

// Ensure global room exists
try {
  const globalRoom: Room = {
    uid: "global",
    name: "Global Chat",
    type: "public",
    description: "The main gathering place for everyone.",
  };
  db.query(
    `INSERT OR IGNORE INTO rooms (id, name, description, type) VALUES ($id, $name, $desc, $type)`
  ).run({
    $id: globalRoom.uid,
    $name: globalRoom.name,
    $desc: globalRoom.description!,
    $type: globalRoom.type,
  });
} catch (e) {
  console.error("Error creating global room:", e);
}

export const createMessage = (msg: Message): boolean => {
  try {
    const query = db.query(`
            INSERT INTO messages (id, sender_id, recipient_id, content, timestamp, read) 
            VALUES ($id, $sender_id, $recipient_id, $room_id, $content, $timestamp, $read)
        `);
    if (!msg.senderId) {
      throw new Error("Cannot save message without senderId");
    }
    query.run({
      $id: msg.id,
      $sender_id: msg.senderId,
      $recipient_id: msg.recipientId || null,
      $room_id: msg.roomId || null,
      $content: msg.text,
      $timestamp: msg.timestamp,
      $read: msg.status === "read" ? 1 : 0,
    });
    return true;
  } catch (error) {
    console.error("Error creating message:", error);
    return false;
  }
};

export const getRoomMessages = (
  roomId: string,
  limit: number = 50
): Message[] => {
  const query = db.query(`
        SELECT m.id, m.sender_id, u.username as sender_name, m.content, m.timestamp, m.read, m.recipient_id, m.room_id
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE m.room_id = $roomId
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

  const rows = query.all({ $roomId: roomId, $limit: limit }) as any[];

  return rows.map((row) => ({
    id: row.id,
    type: "message",
    kind: "chat",
    text: row.content,
    senderId: row.sender_id,
    senderName: row.sender_name,
    recipientId: row.recipient_id, // likely null
    roomId: row.room_id,
    timestamp: row.timestamp,
    status: row.read ? "read" : "sent",
  }));
};

export const getGlobalMessages = (limit: number = 50): Message[] => {
  return getRoomMessages("global", limit);
};

export const getDirectMessages = (
  userA: string,
  userB: string,
  limit: number = 50
): Message[] => {
  const query = db.query(`
        SELECT m.id, m.sender_id, u.username as sender_name, m.recipient_id, m.content, m.timestamp, m.read
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE (m.sender_id = $ua AND m.recipient_id = $ub)
           OR (m.sender_id = $ub AND m.recipient_id = $ua)
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

  const rows = query.all({ $ua: userA, $ub: userB, $limit: limit }) as any[];

  return rows.map((row) => ({
    id: row.id,
    type: "message",
    kind: "chat",
    text: row.content,
    senderId: row.sender_id,
    senderName: row.sender_name,
    recipientId: row.recipient_id,
    timestamp: row.timestamp,
    status: row.read ? "read" : "sent",
  }));
};

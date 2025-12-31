import type { Message } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied

export const createMessage = (msg: Message): boolean => {
  try {
    if (!msg.senderId) {
      throw new Error("Cannot save message without senderId");
    }

    const query = db.query(`
      INSERT INTO messages (
        id,
        sender_id,
        recipient_id,
        content,
        timestamp,
        read
      )
      VALUES (
        $id,
        $sender_id,
        $recipient_id,
        $content,
        $timestamp,
        $read
      )
    `);

    query.run({
      $id: msg.id,
      $sender_id: msg.senderId,
      $recipient_id: msg.recipientId || null,
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

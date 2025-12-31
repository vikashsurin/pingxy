import type { Message } from "../../../shared/src/lib/utils/validation";
import "./schema"; // ensure schema & migrations are applied
import { insertMessage, getDirectMessagesQuery } from "./queries/messages";

export const createMessage = (msg: Message): boolean => {
  try {
    if (!msg.senderId) {
      throw new Error("Cannot save message without senderId");
    }

    insertMessage(
      msg.id,
      msg.senderId,
      msg.recipientId || "", // msg.recipientId is optional string, insertMessage takes string. But logic says recipient_id | null.
      // Wait, insertMessage signature: recipient_id: string. logic: $recipient_id: recipient_id || null.
      // If I pass "", it becomes null in query? No.
      // logic in insertMessage: `$recipient_id: recipient_id || null`. If "" passed, it becomes null.
      // So passing "" is safe if I intend null.
      // HOWEVER, recipient_id might be undefined in msg.
      // So msg.recipientId || "" works.

      msg.text,
      msg.timestamp,
      msg.roomId || null,
      msg.status === "read"
    );

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
  const rows = getDirectMessagesQuery(userA, userB, limit);

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

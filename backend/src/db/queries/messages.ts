import db from "../client";

export interface MessageRow {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  content: string;
  timestamp: number;
  read: number;
}

export const insertMessage = (
  id: string,
  sender_id: string,
  recipient_id: string,
  content: string,
  timestamp: number,
  room_id: string | null,
  read: boolean
): boolean => {
  const query = db.query(`
      INSERT INTO messages (
        id,
        sender_id,
        recipient_id,
        content,
        timestamp,
        room_id,
        read
      )
      VALUES (
        $id,
        $sender_id,
        $recipient_id,
        $content,
        $timestamp,
        $room_id,
        $read
      )
    `);

  query.run({
    $id: id,
    $sender_id: sender_id,
    $recipient_id: recipient_id || null,
    $content: content,
    $timestamp: timestamp,
    $read: read ? 1 : 0,
    $room_id: room_id,
  });
  return true;
};

export const getDirectMessagesQuery = (
  userA: string,
  userB: string,
  limit: number = 50
): MessageRow[] => {
  const query = db.query(`
        SELECT * 
        FROM messages 
        WHERE (sender_id = $ua AND recipient_id = $ub)
           OR (sender_id = $ub AND recipient_id = $ua)
        ORDER BY timestamp DESC
        LIMIT $limit
    `);

  return query.all({ $ua: userA, $ub: userB, $limit: limit }) as MessageRow[];
};

export const updateReadStatus = (
  senderId: string,
  recipientId: string
): boolean => {
  try {
    const query = db.query(`
      UPDATE messages
      SET read = 1
      WHERE sender_id = $senderId AND recipient_id = $recipientId AND read = 0
    `);

    query.run({
      $senderId: senderId,
      $recipientId: recipientId,
    });

    return true;
  } catch (error) {
    console.error("Error updating read status:", error);
    return false;
  }
};

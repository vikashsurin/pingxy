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
        SELECT m.id, m.sender_id, u.username as sender_name, m.recipient_id, m.content, m.timestamp, m.read
        FROM messages m
        JOIN users u ON m.sender_id = u.uid
        WHERE (m.sender_id = $ua AND m.recipient_id = $ub)
           OR (m.sender_id = $ub AND m.recipient_id = $ua)
        ORDER BY m.timestamp ASC
        LIMIT $limit
    `);

  return query.all({ $ua: userA, $ub: userB, $limit: limit }) as MessageRow[];
};

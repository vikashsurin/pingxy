import db from "../client";

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
        $read
      )
    `);

  query.run({
    $id: id,
    $sender_id: sender_id,
    $recipient_id: recipient_id || null,
    $content: content,
    $timestamp: timestamp,
    $read: read,
    $room_id: room_id,
  });
  return true;
};

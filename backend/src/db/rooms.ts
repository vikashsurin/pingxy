import type { Room } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied

export const createRoom = (room: Room): boolean => {
  try {
    const query = db.query(`
            INSERT INTO rooms (id, name, description, created_by, type, max_users)
            VALUES ($id, $name, $desc, $createdBy, $type, $maxUsers)
        `);
    query.run({
      $id: room.uid,
      $name: room.name,
      $desc: room.description || null,
      $createdBy: room.createdBy || null,
      $type: room.type,
      $maxUsers: room.maxUsers || 0,
    });
    return true;
  } catch (error) {
    console.error("Error creating room:", error);
    return false;
  }
};

export const updateRoom = (id: string, updates: Partial<Room>): boolean => {
  try {
    const current = getRoom(id);
    if (!current) return false;

    const updated = { ...current, ...updates };

    const query = db.query(`
            UPDATE rooms 
            SET name = $name, description = $desc, max_users = $maxUsers
            WHERE id = $id
        `);
    query.run({
      $name: updated.name,
      $desc: updated.description || null,
      $maxUsers: updated.maxUsers || 0,
      $id: id,
    });
    return true;
  } catch (error) {
    console.error("Error updating room", error);
    return false;
  }
};

export const deleteRoom = (id: string): boolean => {
  try {
    db.transaction(() => {
      db.query("DELETE FROM messages WHERE room_id = $id").run({ $id: id });
      db.query("DELETE FROM rooms WHERE id = $id").run({ $id: id });
    })();
    return true;
  } catch (error) {
    console.error("Error deleting room", error);
    return false;
  }
};

export const getRoom = (id: string): Room | null => {
  const query = db.query("SELECT * FROM rooms WHERE id = $id");
  const row = query.get({ $id: id }) as any;
  if (!row) return null;
  return {
    uid: row.id,
    name: row.name,
    description: row.description,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).getTime(),
    type: row.type as "public" | "private",
    maxUsers: row.max_users,
  };
};

export const getAllRooms = (): Room[] => {
  const query = db.query("SELECT * FROM rooms");
  const results = query.all() as any[];
  return results.map((row) => ({
    uid: row.id,
    name: row.name,
    description: row.description,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).getTime(),
    type: row.type as "public" | "private",
    maxUsers: row.max_users,
  }));
};

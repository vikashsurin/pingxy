import { Room } from "../../../../shared/src/lib/utils/validation";
import { db } from "../client";


// Exclude password from query results

export const insertRoom = (
  id: string,
  name: string,
  description: string,
  maxUsers: number,
  type: string,
  password: string,
  createdBy: string,
  createdAt: number,
  updatedAt: number,
): void => {
  const query = db.query(`
    INSERT INTO rooms (id, name, description, max_users, type, password, created_by, created_at, updated_at)
    VALUES ($id, $name, $description, $maxUsers, $type, $password, $createdBy, $createdAt, $updatedAt)
    `);

  query.run({
    $id: id,
    $name: name,
    $description: description,
    $maxUsers: maxUsers,
    $type: type,
    $password: password,
    $createdBy: createdBy,
    $createdAt: createdAt,
    $updatedAt: updatedAt,
  });
};


export const fetchRoomById = (id: string): Room | null => {
  const query = db.query(`
        SELECT 
        id,
        name,
        description,
        max_users,
        type,
        created_by,
        created_at,
        updated_at
        FROM rooms WHERE id = $id
    `);

  return query.get({ $id: id }) as Room;
};

export const fetchAllRooms = (): Room[] => {
  const query = db.query(`
        SELECT 
        id,
        name,
        description,
        max_users,
        type,
        created_by,
        created_at,
        updated_at
        FROM rooms
    `);

  return query.all() as Room[];
};

interface RoomUpdate {
  name?: string;
  description?: string;
  max_users?: number;
  type?: string;
  password?: string;
}

export const updateRoomSettings = (id: string, updates: RoomUpdate): void => {
  const keys = Object.keys(updates) as (keyof RoomUpdate)[];
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = $${k}`).join(', ');
  const query = db.query(`
    UPDATE rooms
    SET ${setClause}, updated_at = UNIXEPOCH()
    WHERE id = $id
  `);

  const params: any = { $id: id };
  keys.forEach(k => { params[`$${k}`] = (updates as any)[k]; });

  query.run(params);
};


export const deleteRoomById = (id: string): void => {
  const query = db.query(`
    DELETE FROM rooms
    WHERE id = $id
    `);

  query.run({ $id: id });
};
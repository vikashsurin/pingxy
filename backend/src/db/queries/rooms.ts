import { db } from "../client";

export const insertRoom = (
  id: string,
  name: string,
  isPrivate: number,
  createdBy: string,
  createdAt: number,
  updatedAt: number,
) => {
  const query = db.query(`
       INSET
    `);
};

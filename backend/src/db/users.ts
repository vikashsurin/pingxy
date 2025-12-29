import type { User } from "../../../shared/src/lib/utils/validation";
import db from "./client";
import "./schema"; // ensure schema & migrations are applied

export const createUser = (
  user: User,
  passhash: string | null = null,
  is_guest: boolean = true
): boolean => {
  try {
    const query = db.query(
      "INSERT INTO users (uid, username, data, passhash, is_guest) VALUES ($uid, $username, $data, $passhash, $is_guest)"
    );
    query.run({
      $uid: user.uid,
      $username: user.username,
      $data: JSON.stringify(user),
      $passhash: passhash,
      $is_guest: is_guest ? 1 : 0,
    });
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

export const getUser = (uid: string): User | null => {
  const query = db.query("SELECT data FROM users WHERE uid = $uid");
  const result = query.get({ $uid: uid }) as { data: string } | null;

  if (!result) return null;
  return JSON.parse(result.data) as User;
};

export const getUserWithAuth = (
  username: string
): { user: User; passhash: string | null } | null => {
  const query = db.query(
    "SELECT data, passhash FROM users WHERE username = $username"
  );
  const result = query.get({
    $username: username,
  }) as { data: string; passhash: string | null } | null;

  if (!result) return null;
  return {
    user: JSON.parse(result.data) as User,
    passhash: result.passhash,
  };
};

export const getUserByUsername = (username: string): User | null => {
  const query = db.query("SELECT data FROM users WHERE username = $username");
  const result = query.get({ $username: username }) as { data: string } | null;

  if (!result) return null;
  return JSON.parse(result.data) as User;
};

export const getAllUsers = (): User[] => {
  const query = db.query("SELECT data FROM users");
  const results = query.all() as { data: string }[];
  return results.map((row) => JSON.parse(row.data) as User);
};

export const deleteUser = (uid: string): void => {
  db.query("DELETE FROM users WHERE uid = $uid").run({ $uid: uid });
};

export const updateUser = (uid: string, updates: Partial<User>): boolean => {
  const user = getUser(uid);
  if (!user) return false;

  const updatedUser = { ...user, ...updates };

  try {
    const query = db.query("UPDATE users SET data = $data WHERE uid = $uid");
    query.run({
      $data: JSON.stringify(updatedUser),
      $uid: uid,
    });
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
};

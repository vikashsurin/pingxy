import {
  type Connection,
  connectionSchema,
  Message,
  messageSchema,
} from "@chat/shared/src/lib/utils/tempp.js";
import { HTTPException } from "hono/http-exception";
import * as db from "./db";
// import { verify } from "hono/jwt";
// import { getUser } from "./db/users.js";
// import { getSessionById, updateSessionActivity } from "./db/sessions.js";

// function getJwtSecret(): string {
//   const fromEnv = process.env.JWT_SECRET;
//   const isProd = process.env.NODE_ENV === "production";
//   if (fromEnv) return fromEnv;
//   if (!isProd) return "fallback_secret_for_dev";
//   throw new Error("JWT_SECRET is not configured in production environment");
// }

// // function to validate connections
export function validateConnection(connection: Connection) {
  const validateConnection = connectionSchema.safeParse(connection);

  if (!validateConnection.success) {
    return;
  }
  const validConnection = validateConnection.data;
  return validConnection;
}

// function to validate messages
export function validateMessage(message: Message) {
  const validateMessage = messageSchema.safeParse(message);

  if (!validateMessage.success) {
    return;
  }

  const validMessage = validateMessage.data;
  return validMessage;
}

export async function getAuthUserFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const cookie = cookies.get("_Host-session")?.toString();

  if (!cookie) return null;

  const user = await db.getSessionUser(cookie);

  if (!user) {
    throw new Error("Error while getting user from  session");
  }
  await db.extendSessionAcitivity(cookie);
  return user;
}

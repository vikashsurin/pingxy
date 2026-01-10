import {
  type Connection,
  connectionSchema,
  Message,
  messageSchema,
} from "@chat/shared/src/lib/utils/tempp.js";
import { extendSessionActivity, getSessionUser } from "../../features/sessions";



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

  const user = await getSessionUser(cookie);

  if (!user) {
    throw new Error("Error while getting user from  session");
  }
  await extendSessionActivity(cookie);
  return user;
}

import {
  type Connection,
  connectionSchema,
  Message,
  messageSchema,
  User,
} from "../../shared/src/lib/utils/validation.js";
import { decode } from "hono/jwt";

// function to validate connections
export function validateConnection(connection: Connection) {
  const validateConnection = connectionSchema.safeParse(connection);

  if (!validateConnection.success) {
    console.error("validation error", validateConnection.error);
    return;
  }
  const validConnection = validateConnection.data;
  return validConnection;
}

// function to validate messages
export function validateMessage(message: Message) {
  const validateMessage = messageSchema.safeParse(message);

  if (!validateMessage.success) {
    console.error("validation error", validateMessage.error);
    return;
  }

  const validMessage = validateMessage.data;
  return validMessage;
}

// function to get user data from req
export function getUserDataFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const sessionid = cookies.get("sessionid")?.toString();

  if (!sessionid) return null;

  try {
    const decoded = decode(sessionid);

    if (!decoded?.payload.user) return null;

    const user: User = decoded.payload.user as User;

    return { user };
  } catch (error) {
    console.error("Error decoding sessionid:", error);
    return null;
  }
}

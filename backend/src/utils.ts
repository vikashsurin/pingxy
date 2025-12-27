import {
  type Connection,
  connectionSchema,
  Message,
  messageSchema,
  User,
} from "../../shared/src/lib/utils/validation.js";
import { verify } from "hono/jwt";

// function to validate connections
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

// function to get user data from req
export async function getUserDataFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const sessionid = cookies.get("sessionid")?.toString();

  if (!sessionid) return null;

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    const decoded = await verify(sessionid, secret);

    if (!decoded?.user) return null;

    const user: User = decoded.user as User;

    return { user };
  } catch (error) {
    return null;
  }
}

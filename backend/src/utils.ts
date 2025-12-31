import {
  type Connection,
  connectionSchema,
  Message,
  messageSchema,
  User,
} from "../../shared/src/lib/utils/validation.js";
import { verify } from "hono/jwt";
import { getUser } from "./db/users";
import { getSessionById, updateSessionActivity } from "./db/sessions";

function getJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (fromEnv) return fromEnv;
  if (!isProd) return "fallback_secret_for_dev";
  throw new Error("JWT_SECRET is not configured in production environment");
}

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
// Used by the WebSocket upgrade path; enforces that the session is still valid.
export async function getUserDataFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const sessionid = cookies.get("sessionid")?.toString();

  if (!sessionid) return null;

  try {
    const secret = getJwtSecret();
    const decoded: any = await verify(sessionid, secret);

    const uid = decoded.uid as string | undefined;
    const sid = decoded.sid as string | undefined;
    if (!uid || !sid) return null;

    // Ensure the session is still active (time-bound)
    const session = getSessionById(sid);
    if (!session) return null;

    // Refresh activity for this session so it stays alive while the socket is connected
    updateSessionActivity(sid);

    const user = getUser(uid);
    if (!user) return null;

    return { user, sid };
  } catch (error) {
    return null;
  }
}

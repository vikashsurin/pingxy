import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, decode } from "hono/jwt";
import type { Connection, Message, User } from "../../shared/types";

import { serve } from "bun";

let users: Map<string, User> = new Map();
function init() {
  users.set("global", { uid: "global", username: "global" });
}
init();
let userSockets = new Map();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type', 'Authorization"],
    credentials: true,
  })
);
app.use(prettyJSON());

app.get("/", (c) => {
  return c.json({ users: Array.from(users.values()) });
});

app.use("/chat/*", async (c, next) => {
  const cookie = getCookie(c, "sessionid");

  if (!cookie) {
    return c.json({ message: "not logged in" });
  }
  const decoded = decode(cookie);
  const uid: string = decoded.payload.uid as string;
  const username: string = decoded.payload.username as string;

  c.set("jwtPayload", {
    uid: uid,
    username: username,
  });

  await next();
});

app.get("/chat/users", (c) => {
  const user = c.get("jwtPayload");
  const uid = user?.uid;
  const username = user?.username;

  if (!users.get(uid)) {
    users.set(uid, { uid: uid, username: username });
  }

  return c.json({ users: Array.from(users.values()) });
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  const payload: User = {
    uid: crypto.randomUUID(),
    username: body.username,
  };

  const secret = "mysecret";
  const token = await sign(payload, secret);

  setCookie(c, "sessionid", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    secure: false,
    path: "/",
    sameSite: "lax",
  });

  // save user to users map
  users.set(payload?.uid!, payload);

  return c.json({ uid: payload.uid, username: payload.username, token: token });
});

app.get("/chat/logout", (c) => {
  const uid: string = c.get("jwtPayload")?.uid!;

  // delete user from users map
  users.delete(uid);

  const userSocket = userSockets.get(uid);
  if (userSocket) {
    userSocket.close();
  }

  userSockets.delete(uid);

  deleteCookie(c, "sessionid", {
    maxAge: 0,
    httpOnly: false,
    path: "/",
    secure: false,
    sameSite: "lax",
  });

  return c.json({ message: "logged out" });
});

serve({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      const userData = getUserDataFromReq(req);
      const username: string | undefined = userData?.username!;
      const uid: string | undefined = userData?.uid!;

      const success = server.upgrade(req, {
        data: {
          uid: uid,
          username: username,
        },
      });

      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }
    return app.fetch(req);
  },
  websocket: {
    data: {
      uid: "string",
      username: "string",
    },
    open(ws) {
      console.log(`${ws.data.username} joined`);

      // auto subscribe to the global channel
      ws.subscribe("global");

      function getConnectionStatus() {
        return userSockets.get(ws.data.uid) ? "reconnect" : "join";
      }

      function getConnectionText(status: Connection["status"]) {
        return `${ws.data.username} has ${
          status === "reconnect" ? "reconnected" : "joined the chat"
        }.`;
      }
      // updated connection
      const connection: Connection = {
        type: "connection",
        status: getConnectionStatus(),
        uid: ws.data.uid,
        username: ws.data.username,
        text: getConnectionText(getConnectionStatus()),
      };
      ws.publish(
        "global",
        JSON.stringify({
          ...connection,
        })
      );

      // save the userSocket
      userSockets.set(ws.data.uid, ws);
    },
    close(ws) {
      console.log("closed connection");
      const uid = ws.data.uid;

      // dont sent connection msg if,
      // user has not really logged out
      if (users.has(uid)) return;

      const connection: Connection = {
        type: "connection",
        status: "leave",
        uid: uid,
        username: ws.data.username,
        text: `${ws.data.username} has left the chat.`,
      };

      ws.publish("global", JSON.stringify({ ...connection }));
    },
    message(ws, message) {
      if (typeof message !== "string") return;

      let msg: Message | null = null;

      try {
        msg = JSON.parse(message);
      } catch (error) {
        return;
      }

      if (!msg || typeof msg !== "object") return;

      msg.senderId = ws.data.uid;
      msg.senderName = ws.data.username;

      if (msg?.recipientId === "global" || !msg?.recipientId) {
        ws.publish("global", JSON.stringify({ ...msg }));
      } else {
        const recipientSocket = userSockets.get(msg?.recipientId);
        if (recipientSocket) {
          recipientSocket.send(JSON.stringify({ ...msg }));
        }
      }
    },
  },
  port: 3000,
});

function getUserDataFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const sessionid = cookies.get("sessionid")?.toString();

  if (!sessionid) return null;

  try {
    const decoded = decode(sessionid);
    if (!decoded?.payload?.uid || !decoded?.payload?.username) return null;

    return {
      uid: decoded.payload.uid as string,
      username: decoded.payload.username as string,
    };
  } catch (error) {
    console.error("Error decoding sessionid:", error);
    return null;
  }
}

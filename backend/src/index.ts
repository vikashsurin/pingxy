import { Hono } from "hono";
// import { upgradeWebSocket, websocket } from "hono/bun";
import { cors } from "hono/cors";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, decode } from "hono/jwt";
import { ServerWebSocket } from "bun";
import type { Message } from "../../shared/types";

import { serve } from "bun";

let users = new Map();
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

app.get("/", (c) => {
  console.log({ users });
  return c.text("hello world!");
});

app.get("/chat/users", (c) => {
  return c.json({ users: Array.from(users.values()) });
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  const payload = {
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
  users.set(payload.uid, payload);

  return c.json({ uid: payload.uid, username: payload.username, token: token });
});

app.get("/logout", (c) => {
  const cookie = getCookie(c, "sessionid");

  if (!cookie) {
    return c.json({ message: "not logged in" });
  }
  const decoded = decode(cookie);
  const uid = decoded.payload.uid;

  // delete user from users map
  users.delete(uid);

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

      // save the userSocket
      userSockets.set(ws.data.uid, ws);

      // auto subscribe to the global channel
      ws.subscribe("global");

      // notify other users
      const msg: Message = {
        type: "message",
        text: `${ws.data.username} has joined the chat.`,
        timestamp: Date.now(),
      };
      ws.publish("global", JSON.stringify({ message: msg }));
    },
    close(ws) {
      const msg: Message = {
        type: "message",
        text: `${ws.data.username} has left the chat.`,
        timestamp: Date.now(),
      };
      ws.publish("global", JSON.stringify({ message: msg }));
    },
    message(ws, message) {
      let msg: Message | null = null;
      if (typeof message !== "string") return;

      msg = JSON.parse(message);
      if (msg) {
        msg.senderId = ws.data.uid;
        msg.senderName = ws.data.username;
      }

      ws.publish("global", JSON.stringify({ message: msg }));
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

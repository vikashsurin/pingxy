import { serve } from "bun";

import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, decode } from "hono/jwt";
import { type User } from "../../shared/src/index";

import { getUserDataFromReq } from "./utils";

import { socketHandlers } from "./socketHandlers";

export let users: Map<string, User> = new Map();
export let userSockets = new Map();

function init() {
  users.set("global", {
    uid: "global",
    username: "global",
    age: "0",
    gender: "0",
    country: "0",
  });
}
init();

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

app.get("/api/", (c) => {
  return c.json({ app: "chat" });
});
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

app.use("/api/chat/*", async (c, next) => {
  const cookie = getCookie(c, "sessionid");

  if (!cookie) {
    return c.json({ message: "not logged in" });
  }
  const decoded = decode(cookie);
  const user: User = decoded.payload.user as User;

  c.set("jwtPayload", { user });

  await next();
});

app.get("/api/chat/users", (c) => {
  const user: User = c.get("jwtPayload").user;

  if (!users.get(user.uid)) {
    console.log({ user });
    users.set(user.uid, user);
  }

  return c.json({ users: Array.from(users.values()) });
});

app.post("/api/login", async (c) => {
  const body = await c.req.json();
  const user: User = body.user;

  const payload: { user: User } = {
    user: user,
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
  users.set(user.uid, user);

  return c.json({
    uid: payload.user.uid,
    username: payload.user.username,
    token: token,
  });
});

app.get("/api/chat/logout", (c) => {
  const uid: string = c.get("jwtPayload")?.user.uid!;

  // delete user from users map
  users.delete(uid);

  const userSocket = userSockets.get(uid);
  if (userSocket) {
    userSocket.close();
  }

  // delete user socket
  userSockets.delete(uid);

  // delete session cookie
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
  websocket: socketHandlers,

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws/") {
      const userData = getUserDataFromReq(req);
      const user: User = userData?.user!;

      const success = server.upgrade(req, {
        data: {
          user: user,
        },
      });

      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }
    return app.fetch(req);
  },

  port: 3000,
});

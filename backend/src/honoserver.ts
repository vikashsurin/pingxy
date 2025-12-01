import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { cors } from "hono/cors";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign, decode } from "hono/jwt";

let users = new Map();

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

app.post("/chat/login", async (c) => {
  const body = await c.req.json();

  const payload = {
    uid: crypto.randomUUID(),
    username: body.username,
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
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

  console.log({ users });

  return c.json({ uid: payload.uid, username: payload.username, token: token });
});

app.get("/chat/logout", (c) => {
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
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen: (event, ws) => {
        console.log({ users });
        console.log("connection open");
      },
    };
  })
);

export default {
  fetch: app.fetch,
  websocket,
};

function getUIDFromToken() {}

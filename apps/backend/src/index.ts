import { serve } from "bun";

import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { type WebSocketHandler } from "bun";
import type { User } from "@chat/shared/src/lib/utils/tempp.js";

import { getAuthUserFromReq } from "./utils.js";
import { socketHandlers } from "./socket/socketHandlers.js";

import { authMiddleware } from "./middlewares/auth.js";
import authRouter from "./routes/auth.js";
import { PublicUser } from "@chat/shared/src/lib/utils/validation.js";
import { factory } from "./db/factory/index.js";
import { HTTPException } from "hono/http-exception";
import { setServer } from "./pubsub.js";
// import userRouter from "./routes/users.js";
// import moderationRouter from "./routes/moderation.js";
// import messageRouter from "./routes/messages.js";
import conversationRouter from './routes/conversations.js';
import { WebSocketData } from "./socket/socketHandlers.js";

const app = factory.createApp();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(prettyJSON());


app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: "Internal Server Error " }, 500);
});

app.get("/api/", (c) => {
  return c.json({ app: "chat" });
});
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Protect all /api/users routes EXCEPT /check
// We can use a regex or just apply middleware conditionally, but Hono's router is better used by splitting.
// However, since we mounted userRouter at /api/users, we can intercept /api/users/*
// But we want to exclude /api/users/check.
// Let's use a specific matcher for the middleware.

app.use("/api/users/*", async (c, next) => {
  if (c.req.path === "/api/users/check") {
    await next();
  } else {
    await authMiddleware(c, next);
  }
});

app.route("/api/auth", authRouter);
app.route('/api/conversations', conversationRouter)
// app.route("/api/users", userRouter);
// app.route("/api/mod", moderationRouter);
// app.route("/api/messages", messageRouter);
//

serve({
  websocket: socketHandlers,

  async fetch(req, server) {

    // Store server reference
    setServer(server);

    const url = new URL(req.url);
    if (url.pathname === "/ws/") {
      const user = await getAuthUserFromReq(req);
      if (!user) {
        throw new Error("Unauthorized Websocket Connection");
      }

      const success = server.upgrade(req, {
        data: {
          user,
          activeConversations: new Set()
        } as WebSocketData,
      });

      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }
    return app.fetch(req, { server });
  },

  port: 3000,
});

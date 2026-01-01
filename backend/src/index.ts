import { serve } from "bun";

import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";

import type { User } from "../../shared/src/lib/utils/validation.js";

import { getUserDataFromReq } from "./utils";
import { socketHandlers } from "./socketHandlers";

import { authMiddleware } from "./middlewares/auth";
import authRouter from "./routes/auth";
import userRouter from "./routes/users";
import moderationRouter from "./routes/moderation";
import messageRouter from "./routes/messages";

const app = new Hono();

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
  console.error("Global Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
    },
    500
  );
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
app.route("/api/users", userRouter);
app.route("/api/mod", moderationRouter);
app.route("/api/messages", messageRouter);

serve({
  websocket: socketHandlers,

  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws/") {
      const userData = await getUserDataFromReq(req);
      if (!userData || !userData.user) {
        return new Response("Unauthorized WebSocket", { status: 401 });
      }

      const user: User = userData.user;

      const success = server.upgrade(req, {
        data: {
          user,
        },
      });

      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }
    return app.fetch(req, { server });
  },

  port: 3000,
});

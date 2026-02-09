import { serve } from "bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { factory } from "./common/db/drizzle-factory.js";
import { setupSocketListeners } from "./common/socket/listeners/setup.js";
import { setServer } from "./common/socket/pubsub.js";
import { socketHandler } from "./common/socket/socket.handler.js";
import { WebSocketData } from "./common/socket/types.js";
import { getAuthUserFromReq } from "./common/utils/index.js";
import { registerRoutes } from "./routes/index";
const app = factory.createApp();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(prettyJSON());

app.use(logger());

app.onError((err, ctx) => {
  console.error({ err });

  if (err instanceof HTTPException) {
    return ctx.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  if (err.name === "ZodError") {
    return ctx.json(
      {
        success: false,
        error: "Validation Error",
        details: err.message,
      },
      400,
    );
  }

  return ctx.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    500,
  );
});

app.get("/api/", (c) => {
  console.log("path", c.req.path);
  return c.json({ app: "chat" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

registerRoutes(app);

setupSocketListeners();

serve({
  development: true,
  websocket: socketHandler,

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
          activeConversations: new Set(),
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

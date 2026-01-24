import { serve } from "bun";
import { setServer } from "./core/socket/pubsub.js";
import { socketHandlers } from "./core/socket/socketHandlers.js";
import { WebSocketData } from "./core/socket/types.js";
import { getAuthUserFromReq } from "./core/utils/index.js";

import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { factory } from "./core/db/drizzle-factory";
import { registerRoutes } from "./routes/index";

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

app.use(logger())

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    console.error(err);
    return err.getResponse();
  }
  return c.json({ error: "Internal Server Error " }, 500)
});



app.get("/api/", (c) => {
  console.log("path", c.req.path)
  return c.json({ app: "chat" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});


registerRoutes(app);

serve({
  development: true,
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

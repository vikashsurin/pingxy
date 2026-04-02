import { factory } from "@lib/db/drizzle-factory.js";
import { connectionManager } from "@lib/socket/connectionManager.js";
import { setupSocketListeners } from "@lib/socket/listeners/setup.js";
import { socketHandler } from "@lib/socket/socket.handler.js";
import { WebSocketData } from "@lib/socket/types.js";
import { getAuthUserFromReq } from "@lib/utils/index.js";
import { initStorage } from "@lib/utils/s3/index.js";
import { serve } from "bun";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { registerRoutes } from "./routes/index";
import { initGlobalBus } from "@lib/socket/pubsub";

/*
 * On startup, clear any stale Redis state (e.g., disconnected users)
 */
// await connectionManager.clearStaleState()

const app = factory.createApp();

await initStorage();
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

// app.use(logger());

app.onError((err, ctx) => {
  // Always log the actual error object for the developer
  console.error("DEBUG:", err);

  // 1. Handled HTTP Exceptions (400, 401, 403, 404, etc.)
  if (err instanceof HTTPException) {
    return ctx.json(
      {
        success: false,
        message: err.message, // This will be "User is blocked"
      },
      err.status,
    );
  }

  // 2. Zod Validation Errors
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

  // 3. Unhandled System Crashes (The "Oops" moments)
  return ctx.json(
    {
      success: false,
      message: "An unexpected error occurred", // Masked for security
    },
    500,
  );
});

app.get("/api/", (c) => {
  return c.json({ app: "pingxy" });
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
    connectionManager.setServer(server);

    initGlobalBus();

    const url = new URL(req.url);
    if (url.pathname === "/ws/" || url.pathname === "/ws") {
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

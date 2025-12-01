import { UUID } from "crypto";
import type { Message, Topic } from "../../shared/types";
import { ServerWebSocket } from "bun";

const topic: Topic = {
  name: "global",
  id: crypto.randomUUID(),
};

let clients = new Map();
let topics = new Map();
let topicSubscribers = new Map();

const server = Bun.serve({
  fetch(req, server) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const path = new URL(req.url).pathname;

    if (path === "/topics")
      return new Response(
        JSON.stringify({ topics: Array.from(topics.values()) }),
        { headers }
      );

    if (req.method === "POST" && path === "/") {
      console.log("upgrade");
      const username = getUsernameFromReq(req);
      return Response.json({ username });
    }

    const success = server.upgrade(req, {
      data: {
        socketId: crypto.randomUUID(),
        name: "Anonymous",
        createdAt: Date.now(),
        subscriptions: new Set(),
        authToken: "secret",
      },
    });
    if (success) {
      // Bun automatically returns a 101 Switching Protocols
      // if the upgrade succeeds
      return undefined;
    }

    // handle HTTP request normally
    return new Response("Hello world!");
  },

  websocket: {
    // TypeScript: specify the type of ws.data like this
    data: {} as {
      socketId: UUID;
      name: string;
      createdAt: number;
      subscriptions: Set<string>;
      authToken: string;
    },

    open(ws) {
      console.log("A user joined");
      clients.set(ws.data.socketId, ws);

      // ws.subscribe("global");
      subscribeToTopic({ ws, topic });

      ws.send(JSON.stringify({ socketId: ws.data.socketId }));
    },

    async message(ws, message) {
      let msg: Message;
      if (typeof message === "string") {
        msg = JSON.parse(message);
        if (msg.type === "join") {
          let topic: Topic = {
            name: msg.channel || "",
            id: crypto.randomUUID(),
          };
          subscribeToTopic({ ws, topic });
          console.log({ topics });
        }

        ws.send(JSON.stringify({ message: msg.message, type: "message" }));
      }
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

// Helper functions

function subscribeToTopic({
  ws,
  topic,
}: {
  ws: ServerWebSocket;
  topic: Topic;
}) {
  if (!ws.data.subscriptions.has(topic.name)) {
    ws.data.subscriptions.add(topic.name);

    ws.subscribe(topic.name);

    if (!topics.has(topic.id)) {
      topics.set(topic.id, {
        name: topic.name,
        id: topic.id,
        admin: ws.data.socketId,
      });
    }

    server.publish(
      topic.name,
      JSON.stringify({ type: "message", message: "joined the chat" })
    );

    if (!topicSubscribers.has(topic.id)) {
      topicSubscribers.set(topic.id, new Set());
    }
    topicSubscribers.get(topic.id).add(ws.data.socketId);
  }

  // console.log({ topicsub: topicSubscribers });
}

function getUsernameFromReq(req) {
  console.log("req", req);
  // const username = req.body.get("username");
  // return username;

  return "Anon";
}

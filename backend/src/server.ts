const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = Bun.serve({
  routes: {
    "/chat/login": {
      OPTIONS: () => new Response(null, { headers }),
      POST: async (req) => {
        const body = await req.json();
        const cookies = req.cookies;

        cookies.set("token", "secret", {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: false,
          secure: true,
          path: "/",
        });

        return new Response(JSON.stringify({ username: body.username }), {
          status: 200,
          headers,
        });
      },
    },
    "/chat": {
      OPTIONS: () => new Response(null, { headers }),
      GET: (req, server) => {
        const success = server.upgrade(req, { data: {} });
        if (success) return undefined;

        return new Response(null, {
          status: 200,
          headers: headers,
        });
      },
    },
  },

  websocket: {
    data: {},
    open(ws) {
      console.log("A user joined");
    },
    message(ws, message) {
      console.log(message);
    },
    close(ws) {
      console.log("A user left");
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);

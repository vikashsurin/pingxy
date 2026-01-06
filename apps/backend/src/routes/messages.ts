// import { Hono } from "hono";
// import { getDirectMessages } from "../db/messages";
// import { authMiddleware } from "../middlewares/auth";

// const app = new Hono();

// // app.use(authMiddleware);

// app.get("/history/:userA/:userB", async (c) => {
//   const userA = c.req.param("userA");
//   const userB = c.req.param("userB");
//   const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;
//   const messages = getDirectMessages(userA, userB, limit);
//   return c.json({ messages }, 200);
// });

// export default app;

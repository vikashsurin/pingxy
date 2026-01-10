import { factory } from "@core/db/drizzle-factory";
import { authMiddleware } from "@core/middlewares/auth";

const app = factory.createApp();

app.use("/api/users/*", async (c, next) => {
  if (c.req.path === "/api/users/check") {
    await next();
  } else {
    await authMiddleware(c, next);
  }
});

export const userRouter = app;

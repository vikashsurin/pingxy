import { factory } from "../../core/db/drizzle-factory";
import { authMiddleware } from "../../core/middlewares/auth";

const app = factory.createApp();

app.use(authMiddleware);

export const conversationRouter = app;

import { MessagePayload } from "@chat/shared/types";
import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth";
import { publish } from "src/common/socket/pubsub";
import * as services from "./message.service";

const app = factory.createApp();

app.use(authMiddleware);

//Create New Message
app.post("/", authMiddleware,);
export const messageRouter = app;

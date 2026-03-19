import { factory } from "@lib/db/drizzle-factory";
import { UserController } from "./user.controller";

export const userRouter = factory.createApp();

userRouter.get("/check", ...UserController.checkUser);
userRouter.get("/:id", ...UserController.getUserById);

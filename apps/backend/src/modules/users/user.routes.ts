import { factory } from "src/common/db/drizzle-factory";
import { UserController } from "./user.controller";

export const userRouter = factory.createApp();

userRouter.get("/check", ...UserController.checkUser);
userRouter.get("/id/:id", ...UserController.getUserById);

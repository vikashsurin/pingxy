import { factory } from "src/common/db/drizzle-factory";
import { authMiddleware } from "src/common/middlewares/auth.js";

import { AuthController } from "./auth.controller";

export const authRouter = factory.createApp();

authRouter.get("/verify", authMiddleware, AuthController.verify);
authRouter.get("/me", authMiddleware, AuthController.me);
authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/guest", AuthController.guest);
authRouter.post("/logout", AuthController.logout);

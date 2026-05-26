import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth.js";

import { AuthController } from "./auth.controller";

export const router = factory.createApp();

router.get("/verify", authMiddleware, AuthController.verify);
router.get("/me", authMiddleware, AuthController.me);
router.get("/profile", authMiddleware, AuthController.profile);
router.post("/register", ...AuthController.register);
router.post("/login", ...AuthController.login);
router.post("/logout", AuthController.logout);
router.put('/update-password', authMiddleware, ...AuthController.updatePassword)
router.post('/forgot-password', ...AuthController.forgotPassword)
router.post("/reset-password", ...AuthController.resetPassword)
export const authRouter = router;

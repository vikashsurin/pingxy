import { factory } from "@lib/db/drizzle-factory";
import { UserController } from "./user.controller";

export const router = factory.createApp();

router.get("/check", ...UserController.checkUser);
router.get("/:id", ...UserController.getUserById);

export const userRouter = router

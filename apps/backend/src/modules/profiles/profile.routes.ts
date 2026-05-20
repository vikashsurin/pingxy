import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ProfileController } from "./profile.controller";

const router = factory.createApp()
router.use(authMiddleware)

router.post("/", ...ProfileController.createProfile)
router.put("/:id", ...ProfileController.updateProfile)
router.delete("/:id", ...ProfileController.deleteProfile)


export const profileRouter = router

import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ProfileController } from "./profile.controller";

const router = factory.createApp()
router.use(authMiddleware)

router.get("/", ...ProfileController.getProfile)
router.post("/", ...ProfileController.createProfile)
router.put("/", ...ProfileController.updateProfile)
router.delete("/", ...ProfileController.deleteProfile)


export const profileRouter = router

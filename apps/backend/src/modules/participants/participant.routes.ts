import { factory } from "@lib/db/drizzle-factory";
import { participantController } from "./participant.controller";
import { authMiddleware } from "@lib/middlewares/auth";

export const participantRouter = factory.createApp();

participantRouter.use(authMiddleware)

participantRouter.patch('/', ...participantController.updateParticipant)

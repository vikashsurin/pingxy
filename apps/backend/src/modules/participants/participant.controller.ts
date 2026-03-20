import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import { updatePartReqSchema } from "@pingxy/shared/domain";
import { ParticipantService } from "./participant.service";

function createParticipantController() {
  const updateParticipant = factory.createHandlers(
    validate('json', updatePartReqSchema),
    async (c) => {

      console.log("reached controller")
      const user = c.get('user')
      console.log("user from controller", user)
      const data = c.req.valid('json')
      const updatedParticipant = await ParticipantService.updateParticipant(data.payload, user)

      return c.json({})
    });

  return {
    updateParticipant
  };
}

export const participantController = createParticipantController();
